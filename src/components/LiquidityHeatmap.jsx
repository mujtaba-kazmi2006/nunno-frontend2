/**
 * LiquidityHeatmap
 * 
 * Renders a canvas-based heatmap overlay on top of the lightweight-charts chart.
 * Data source: real Binance order book depth + open interest clustering.
 * 
 * Props:
 *   chartRef        - ref to the lightweight-charts chart instance
 *   containerRef    - ref to the chart container div
 *   symbol          - trading pair, e.g. "BTCUSDT"
 *   isVisible       - boolean toggle
 *   currentPrice    - live price for sync
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Droplets, RefreshCw, Info } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const REFRESH_INTERVAL_MS = 30_000; // refresh every 30s (order books change fast)

// --- Colour scale: navy → cyan → yellow → orange → red ---
function intensityToRGBA(intensity, type, alpha = 0.85) {
    // Separate colour channels for bid walls vs ask walls vs OI
    if (type === 'bid_wall' || type === 'mixed') {
        // Bids: teal → green → yellow
        const r = Math.round(intensity * 220);
        const g = Math.round(80 + intensity * 175);
        const b = Math.round(120 - intensity * 100);
        return `rgba(${r},${g},${b},${alpha})`;
    } else if (type === 'ask_wall') {
        // Asks: purple → magenta → red
        const r = Math.round(180 + intensity * 75);
        const g = Math.round(20 + intensity * 30);
        const b = Math.round(180 - intensity * 120);
        return `rgba(${r},${g},${b},${alpha})`;
    } else {
        // OI clusters: sky blue
        const r = Math.round(20 + intensity * 40);
        const g = Math.round(150 + intensity * 80);
        const b = Math.round(255);
        return `rgba(${r},${g},${b},${alpha * 0.7})`;
    }
}

export default function LiquidityHeatmap({ chartRef, containerRef, symbol, isVisible, currentPrice }) {
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);
    const dataRef = useRef(null);   // latest heatmap data
    const lastFetchRef = useRef(0);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [dataQuality, setDataQuality] = useState('');
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    // ------------------------------------------------------------------
    // Fetch heatmap data from backend
    // ------------------------------------------------------------------
    const fetchHeatmap = useCallback(async () => {
        if (!symbol || !isVisible) return;
        const now = Date.now();
        if (now - lastFetchRef.current < 8000) return; // don't fetch more than every 8s
        lastFetchRef.current = now;

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/liquidity/heatmap/${symbol}?depth_pct=5`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            dataRef.current = json;
            setDataQuality(json.data_quality || '');
            setLastUpdate(new Date());
            setStats({
                totalBid: json.total_bid_usd,
                totalAsk: json.total_ask_usd,
                ratio: json.bid_ask_ratio,
                bidWalls: json.bid_walls || [],
                askWalls: json.ask_walls || [],
                oiClusters: json.oi_clusters || [],
            });
        } catch (e) {
            setError(e.message);
            console.error('[LiquidityHeatmap] fetch failed:', e);
        } finally {
            setIsLoading(false);
        }
    }, [symbol, isVisible]);

    // Auto-refresh
    useEffect(() => {
        if (!isVisible) return;
        fetchHeatmap();
        const timer = setInterval(fetchHeatmap, REFRESH_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [fetchHeatmap, isVisible, symbol]);

    // ------------------------------------------------------------------
    // Canvas rendering — runs every animation frame for smooth sync
    // with the chart's visible price range
    // ------------------------------------------------------------------
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        const chart = chartRef?.current;
        const container = containerRef?.current;

        if (!canvas || !chart || !container || !dataRef.current || !isVisible) {
            animFrameRef.current = requestAnimationFrame(render);
            return;
        }

        const data = dataRef.current;
        const levels = data.levels || [];
        if (levels.length === 0) {
            animFrameRef.current = requestAnimationFrame(render);
            return;
        }

        // Sync canvas size with container
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = rect.width;
        const h = rect.height;

        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
        }

        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        // Get the chart's price scale so we can convert price → y-pixel accurately
        let priceToY;
        try {
            const priceScale = chart.priceScale('right');
            // Convert price to coordinate using the main series
            const mainSeries = chart.series ? chart.series()[0] : null;
            if (!mainSeries) {
                animFrameRef.current = requestAnimationFrame(render);
                return;
            }
            priceToY = (price) => mainSeries.priceToCoordinate(price);
        } catch {
            animFrameRef.current = requestAnimationFrame(render);
            return;
        }

        // Calculate the heatmap strip width (left-aligned, ~60px)
        const STRIP_WIDTH = 62;
        const MARGIN_RIGHT = 70; // leave space for price axis
        const heatmapRight = w - MARGIN_RIGHT;
        const heatmapLeft = heatmapRight - STRIP_WIDTH;

        // Find max USD value for this draw call to normalise bar widths
        const maxUsd = Math.max(...levels.map(l => l.total_usd), 1);

        // --- Draw each level as a horizontal bar ---
        for (const level of levels) {
            if (level.intensity < 0.01) continue;

            const y = priceToY(level.price);
            if (y === null || y === undefined || y < 0 || y > h) continue;

            // Height of each bin row in pixels
            const nextY = priceToY(level.price - (data.price_max - data.price_min) / 200);
            const binH = nextY !== null ? Math.abs(nextY - y) : 2;
            const rowH = Math.max(1, Math.min(binH, 8));

            // Bar width proportional to USD volume
            const barW = (level.total_usd / maxUsd) * STRIP_WIDTH;

            // Draw the bar
            ctx.fillStyle = intensityToRGBA(level.intensity, level.label, 0.75);
            ctx.fillRect(heatmapRight - barW, y - rowH / 2, barW, rowH);
        }

        // --- Draw top bid/ask walls as annotated lines ---
        const topBids = data.bid_walls?.slice(0, 3) || [];
        const topAsks = data.ask_walls?.slice(0, 3) || [];

        const drawWallLine = (price, color, label, usd) => {
            const y = priceToY(price);
            if (y === null || y < 4 || y > h - 4) return;

            // Dashed line across visible chart area
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(heatmapLeft - 4, y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            // Label pill
            const usdLabel = usd >= 1e6 ? `$${(usd / 1e6).toFixed(1)}M` : `$${(usd / 1e3).toFixed(0)}K`;
            const text = `${label} ${usdLabel}`;
            ctx.save();
            ctx.font = 'bold 9px "Inter", system-ui, sans-serif';
            const tw = ctx.measureText(text).width + 8;

            // Pill background
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(heatmapLeft - tw - 6, y - 7, tw, 14, 3);
            ctx.fill();

            // Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, heatmapLeft - tw - 2, y + 4);
            ctx.restore();
        };

        topBids.forEach(b => drawWallLine(b.price, '#22c55e', '🔵 BID', b.bid_usd));
        topAsks.forEach(a => drawWallLine(a.price, '#ef4444', '🔴 ASK', a.ask_usd));

        // OI clusters
        const topOI = data.oi_clusters?.slice(0, 2) || [];
        topOI.forEach(o => drawWallLine(o.price, '#38bdf8', '⚡ OI', o.oi_usd));

        // --- Current price marker on the strip ---
        if (currentPrice) {
            const y = priceToY(currentPrice);
            if (y !== null && y >= 0 && y <= h) {
                ctx.save();
                ctx.strokeStyle = '#a855f7';
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.9;
                ctx.setLineDash([2, 2]);
                ctx.beginPath();
                ctx.moveTo(heatmapLeft - 4, y);
                ctx.lineTo(heatmapRight + 4, y);
                ctx.stroke();
                ctx.restore();
            }
        }

        // --- Strip label ---
        ctx.save();
        ctx.font = 'bold 8px "Inter", system-ui, sans-serif';
        ctx.fillStyle = 'rgba(148,163,184,0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('LIQUIDITY', heatmapRight - STRIP_WIDTH / 2, 14);
        ctx.restore();

        animFrameRef.current = requestAnimationFrame(render);
    }, [chartRef, containerRef, isVisible, currentPrice]);

    // Start/stop render loop
    useEffect(() => {
        if (isVisible) {
            animFrameRef.current = requestAnimationFrame(render);
        }
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [render, isVisible]);

    if (!isVisible) return null;

    const formatUSD = (v) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B`
        : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M`
            : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K`
                : `$${v.toFixed(0)}`;

    return (
        <>
            {/* The canvas sits absolutely over the chart — pointer-events:none so chart stays interactive */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 10,
                }}
            />

            {/* Info panel — bottom left of chart */}
            <div style={{
                position: 'absolute',
                bottom: 48,
                left: 8,
                zIndex: 20,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
            }}>
                {/* Status badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'rgba(8,8,20,0.82)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 8,
                    padding: '3px 8px',
                    backdropFilter: 'blur(4px)',
                }}>
                    {isLoading ? (
                        <RefreshCw size={8} style={{ color: '#a855f7', animation: 'spin 1s linear infinite' }} />
                    ) : (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                    )}
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {isLoading ? 'Fetching…' : dataQuality === 'live' ? 'Live OB' : dataQuality || 'Heatmap'}
                    </span>
                    {lastUpdate && (
                        <span style={{ fontSize: 8, color: '#475569' }}>
                            {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    )}
                </div>

                {/* Bid/Ask ratio */}
                {stats && (
                    <div style={{
                        background: 'rgba(8,8,20,0.82)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 8,
                        padding: '4px 8px',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: '#22c55e', minWidth: 28 }}>BID</span>
                            <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min(100, (stats.ratio / (stats.ratio + 1)) * 100)}%`,
                                    background: '#22c55e',
                                    borderRadius: 2,
                                    transition: 'width 0.5s',
                                }} />
                            </div>
                            <span style={{ fontSize: 8, color: '#94a3b8', minWidth: 38, textAlign: 'right' }}>{formatUSD(stats.totalBid)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', minWidth: 28 }}>ASK</span>
                            <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min(100, (1 / (stats.ratio + 1)) * 100)}%`,
                                    background: '#ef4444',
                                    borderRadius: 2,
                                    transition: 'width 0.5s',
                                }} />
                            </div>
                            <span style={{ fontSize: 8, color: '#94a3b8', minWidth: 38, textAlign: 'right' }}>{formatUSD(stats.totalAsk)}</span>
                        </div>
                        <div style={{ fontSize: 8, color: stats.ratio > 1.15 ? '#22c55e' : stats.ratio < 0.85 ? '#ef4444' : '#94a3b8', fontWeight: 700, marginTop: 1 }}>
                            Ratio: {stats.ratio?.toFixed(2)}x {stats.ratio > 1.15 ? '▲ Buy Pressure' : stats.ratio < 0.85 ? '▼ Sell Pressure' : '— Balanced'}
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{ fontSize: 8, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        ⚠ {error}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div style={{
                position: 'absolute',
                bottom: 48,
                right: 78, // just left of price axis
                zIndex: 20,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                background: 'rgba(8,8,20,0.75)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: '4px 7px',
            }}>
                {[
                    { color: '#22c55e', label: 'Bid Wall' },
                    { color: '#ef4444', label: 'Ask Wall' },
                    { color: '#38bdf8', label: 'OI Zone' },
                ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: color, opacity: 0.85 }} />
                        <span style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                    </div>
                ))}
            </div>
        </>
    );
}
