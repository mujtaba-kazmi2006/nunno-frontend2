import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createChart } from 'lightweight-charts';
import {
    PlayCircle,
    PauseCircle,
    RotateCcw,
    Settings,
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
    Layers,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Camera,
    ChevronDown,
    MessageSquare,
    X,
    Sparkles,
    Maximize2,
    Minimize2,
    FastForward,
    Minus,
    Plus,
    Zap,
    Brain,
    Search,
    Crosshair,
    Target,
    AlertTriangle,
    CheckCircle2,
    Clock
} from 'lucide-react';
import {
    calculateEMA,
    calculateRSI,
    calculateMACD,
    calculateBollingerBands,
    calculateSupportResistance,
    calculateATR,
    getCurrentValue
} from '../utils/technicalIndicators';
import PatternChatPanel from './PatternChatPanel';
import { useTheme } from '../contexts/ThemeContext';

const EliteChart = () => {
    // Chart refs
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const mainSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);
    const indicatorSeriesRefs = useRef({});
    const priceLineRefs = useRef([]);
    const blueprintLineRefs = useRef({ entry: null, target: null, stop: null });

    // Data state
    const [searchParams] = useSearchParams();
    const [chartData, setChartData] = useState([]);
    const [symbol, setSymbol] = useState(searchParams.get('ticker') || 'BTCUSDT');
    const [interval, setInterval] = useState('1m');
    const [isStreaming, setIsStreaming] = useState(true);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [priceChange, setPriceChange] = useState(0);

    // Update symbol if URL parameter changes
    useEffect(() => {
        const ticker = searchParams.get('ticker');
        if (ticker) {
            setSymbol(ticker.toUpperCase());
        }
    }, [searchParams]);

    // UI state
    const [chartType, setChartType] = useState('candlestick');
    const { theme } = useTheme();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1280);
    const [showIndicatorsDropdown, setShowIndicatorsDropdown] = useState(false);
    const [showAIChat, setShowAIChat] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Watch for window resize to handle responsiveness
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 1024);
            // Auto-collapse on smaller desktop screens
            if (width < 1280 && width >= 1024) {
                setIsSidebarCollapsed(true);
            } else if (width >= 1280) {
                setIsSidebarCollapsed(false);
            }
        };
        window.addEventListener('resize', handleResize);

        const handleClickOutside = (event) => {
            if (tickerMenuRef.current && !tickerMenuRef.current.contains(event.target)) {
                setIsTickerMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Indicators state
    const [selectedIndicators, setSelectedIndicators] = useState({
        ema9: false,
        ema21: false,
        ema50: false,
        ema100: false,
        ema200: false,
        rsi: false,
        macd: false,
        bollingerBands: false,
        supportResistance: true,
        atr: false
    });
    const [calculatedIndicators, setCalculatedIndicators] = useState({});

    // Simulation state
    const [simulationMode, setSimulationMode] = useState(null);
    const [simulationActive, setSimulationActive] = useState(false);
    const [projectionSeries, setProjectionSeries] = useState(null);
    const [activeAiPattern, setActiveAiPattern] = useState(null);

    // Blueprint / Judge My Trade state
    const [isBlueprintMode, setIsBlueprintMode] = useState(false);
    const [blueprintPrices, setBlueprintPrices] = useState({ entry: 0, target: 0, stop: 0 });
    const [blueprintStep, setBlueprintStep] = useState(null); // 'entry', 'target', 'stop'
    const [blueprintVerdict, setBlueprintVerdict] = useState(null);
    const [showDetailedVerdict, setShowDetailedVerdict] = useState(false);
    const [isJudging, setIsJudging] = useState(false);

    // UI Enhancement state
    const [focusMode, setFocusMode] = useState(false);
    const [indicatorCategory, setIndicatorCategory] = useState('all'); // 'all', 'trend', 'momentum', 'volatility'
    const [isTickerMenuOpen, setIsTickerMenuOpen] = useState(false);
    const [tickerSearch, setTickerSearch] = useState('');
    const tickerMenuRef = useRef(null);

    // WebSocket ref
    const wsRef = useRef(null);

    // Token options
    const tokenOptions = [
        { symbol: 'BTCUSDT', name: 'Bitcoin' },
        { symbol: 'ETHUSDT', name: 'Ethereum' },
        { symbol: 'SOLUSDT', name: 'Solana' },
        { symbol: 'BNBUSDT', name: 'BNB' },
        { symbol: 'XRPUSDT', name: 'XRP' },
        { symbol: 'ADAUSDT', name: 'Cardano' },
        { symbol: 'DOGEUSDT', name: 'Dogecoin' },
        { symbol: 'DOTUSDT', name: 'Polkadot' },
        { symbol: 'AVAXUSDT', name: 'Avalanche' },
        { symbol: 'LINKUSDT', name: 'Chainlink' },
        { symbol: 'PEPEUSDT', name: 'Pepe' },
        { symbol: 'SHIBUSDT', name: 'Shiba Inu' },
        { symbol: 'MATICUSDT', name: 'Polygon' },
        { symbol: 'NEARUSDT', name: 'Near' },
        { symbol: 'LTCUSDT', name: 'Litecoin' },
        { symbol: 'ARBUSDT', name: 'Arbitrum' },
        { symbol: 'OPUSDT', name: 'Optimism' },
        { symbol: 'APTUSDT', name: 'Aptos' },
        { symbol: 'SUIUSDT', name: 'Sui' },
        { symbol: 'INJUSDT', name: 'Injective' },
        { symbol: 'RNDRUSDT', name: 'Render' },
        { symbol: 'FETUSDT', name: 'Fetch.ai' },
        { symbol: 'STRUSDT', name: 'Star' }
    ];

    const filteredOptions = tokenOptions.filter(token =>
        token.symbol.toLowerCase().includes(tickerSearch.toLowerCase()) ||
        token.name.toLowerCase().includes(tickerSearch.toLowerCase())
    );

    // Initialize chart once
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            layout: {
                background: { color: theme === 'dark' ? '#16161e' : '#ffffff' },
                textColor: theme === 'dark' ? '#cbd5e1' : '#334155',
                fontSize: 12,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            },
            grid: {
                vertLines: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' },
                horzLines: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' }
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: '#8b5cf6',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#8b5cf6'
                },
                horzLine: {
                    color: '#8b5cf6',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#8b5cf6'
                }
            },
            rightPriceScale: {
                borderColor: theme === 'dark' ? '#1e293b' : '#cbd5e1',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.25
                }
            },
            timeScale: {
                borderColor: theme === 'dark' ? '#1e293b' : '#cbd5e1',
                timeVisible: true,
                secondsVisible: false
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true
            }
        });

        chartRef.current = chart;

        // Add volume series first (background)
        const volumeSeries = chart.addHistogramSeries({
            color: '#8b5cf6',
            priceFormat: {
                type: 'volume'
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.85,
                bottom: 0
            }
        });
        volumeSeriesRef.current = volumeSeries;

        // Add main series (candlestick by default)
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderUpColor: '#22c55e',
            borderDownColor: '#ef4444',
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444'
        });
        mainSeriesRef.current = candlestickSeries;

        // Use ResizeObserver for perfect auto-scaling when sidebars toggle
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries.length === 0 || !entries[0].contentRect) return;
            const { width, height } = entries[0].contentRect;
            if (chartRef.current) {
                chartRef.current.applyOptions({ width, height });
            }
        });
        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
            disconnectWebSocket();
        };
    }, []); // Run only once

    // Handle theme change without re-creating the chart
    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.applyOptions({
                layout: {
                    background: { color: theme === 'dark' ? '#16161e' : '#ffffff' },
                    textColor: theme === 'dark' ? '#cbd5e1' : '#334155',
                },
                grid: {
                    vertLines: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' },
                    horzLines: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' }
                },
                rightPriceScale: {
                    borderColor: theme === 'dark' ? '#1e293b' : '#cbd5e1',
                },
                timeScale: {
                    borderColor: theme === 'dark' ? '#1e293b' : '#cbd5e1',
                }
            });
        }
    }, [theme]);

    // Handle blueprint mode clicks
    useEffect(() => {
        if (!chartRef.current || !isBlueprintMode) return;

        const handleChartClick = (param) => {
            if (!param.point) return;

            const price = mainSeriesRef.current.coordinateToPrice(param.point.y);
            if (!price) return;

            if (blueprintStep === 'entry') {
                setBlueprintPrices(prev => ({ ...prev, entry: price }));
                updateBlueprintLines('entry', price);
                setBlueprintStep('target');
            } else if (blueprintStep === 'target') {
                setBlueprintPrices(prev => ({ ...prev, target: price }));
                updateBlueprintLines('target', price);
                setBlueprintStep('stop');
            } else if (blueprintStep === 'stop') {
                setBlueprintPrices(prev => ({ ...prev, stop: price }));
                updateBlueprintLines('stop', price);
                setBlueprintStep(null);
            }
        };

        chartRef.current.subscribeClick(handleChartClick);
        return () => {
            if (chartRef.current) chartRef.current.unsubscribeClick(handleChartClick);
        };
    }, [isBlueprintMode, blueprintStep]);

    const updateBlueprintLines = (type, price) => {
        if (!mainSeriesRef.current) return;

        // Colors
        const colors = {
            entry: '#3b82f6',
            target: '#22c55e',
            stop: '#ef4444'
        };

        // Remove old line if exists
        if (blueprintLineRefs.current[type]) {
            try { mainSeriesRef.current.removePriceLine(blueprintLineRefs.current[type]); } catch (e) { }
        }

        // Add new line
        const newLine = mainSeriesRef.current.createPriceLine({
            price: price,
            color: colors[type],
            lineWidth: 2,
            lineStyle: 0,
            axisLabelVisible: true,
            title: type.toUpperCase()
        });

        blueprintLineRefs.current[type] = newLine;
    };

    const toggleBlueprintMode = () => {
        const newMode = !isBlueprintMode;
        setIsBlueprintMode(newMode);

        if (newMode) {
            setBlueprintStep('entry');
            setBlueprintVerdict(null);
            // Clear existing simulations
            if (projectionSeries && chartRef.current) {
                chartRef.current.removeSeries(projectionSeries);
                setProjectionSeries(null);
            }
            setSimulationActive(false);
        } else {
            setBlueprintStep(null);
            // Clear lines
            Object.keys(blueprintLineRefs.current).forEach(type => {
                if (blueprintLineRefs.current[type]) {
                    try { mainSeriesRef.current.removePriceLine(blueprintLineRefs.current[type]); } catch (e) { }
                    blueprintLineRefs.current[type] = null;
                }
            });
        }
    };

    const judgeTrade = () => {
        if (!blueprintPrices.entry || !blueprintPrices.target || !blueprintPrices.stop) {
            alert('Please set all markers (Entry, Target, Stop) on the chart first.');
            return;
        }

        setIsJudging(true);

        // Simulate deep analysis delay for "WOW" factor
        setTimeout(() => {
            const { entry, target, stop } = blueprintPrices;
            const isLong = target > entry;
            const risk = Math.abs(entry - stop);
            const reward = Math.abs(target - entry);
            const rr = (reward / risk).toFixed(2);

            // Technical Analysis Input
            const rsi = getCurrentValue(calculatedIndicators.rsi) || 50;
            const atr = getCurrentValue(calculatedIndicators.atr) || entry * 0.02;

            let score = 5;
            let comment = "";
            let suggestion = "";
            let status = 'neutral';

            // Risk/Reward Scoring
            if (rr >= 2.5) score += 2;
            else if (rr < 1) score -= 2;

            // Trend & RSI Alignment
            if (isLong) {
                if (rsi < 40) { score += 1; comment = "Great entry during oversold conditions."; }
                else if (rsi > 70) { score -= 2; comment = "High risk! You're buying into an overbought climax."; }
                else { comment = "Solid structural setup based on current momentum."; }

                if (risk < atr * 0.5) {
                    suggestion = "Your stop is too tight. Current volatility will likely wick you out.";
                    score -= 1;
                } else {
                    suggestion = "Risk management looks professional. Ensure you scale out at the first target.";
                }
                status = score > 6 ? 'bullish' : 'neutral';
            } else {
                // Short logic
                if (rsi > 60) { score += 1; comment = "Good timing. Fading the overextended rally."; }
                else if (rsi < 30) { score -= 2; comment = "Careful, you're shorting into a potential local bottom."; }
                else { comment = "Short setup looks technically sound."; }

                if (risk < atr * 0.5) {
                    suggestion = "Stop loss is too close. Give the trade more 'breathing room' based on ATR.";
                    score -= 1;
                } else {
                    suggestion = "Target looks realistic. Watch for liquidity walls on the way down.";
                }
                status = score > 6 ? 'bearish' : 'neutral';
            }

            // Construct Detailed Opinion Narrative
            let opinion = "";
            if (isLong) {
                opinion = `This LONG setup carries a score of ${score}/10. `;
                if (rsi < 40) opinion += "We are currently seeing significant bullish divergence/oversold conditions on the RSI, which historically suggests a high-probability reversal zone. ";
                else if (rsi > 70) opinion += "Warning: You are attempting to 'chase' a parabolic move. Historically, entering at these RSI levels leads to significant drawdown as liquidity providers take profit. ";

                if (rr >= 2.5) opinion += `Your Risk/Reward ratio of ${rr}:1 is excellent, allowing for a 'safety margin' where you can be wrong more than 50% of the time and still be profitable. `;
                else opinion += `The Risk/Reward of ${rr}:1 is sub-optimal. You are risking almost as much as you aim to gain, which requires a very high win rate to stay solvent. `;

                if (risk < atr * 0.5) opinion += "Your Stop Loss is placed within the 'Noise Zone' (below 0.5 ATR). You are likely to be stopped out by normal market volatility before the trade idea even has a chance to play out.";
                else opinion += "Placing the Stop outside the ATR range shows professional discipline, protecting you from random market wicks.";
            } else {
                opinion = `This SHORT setup is rated ${score}/10. `;
                if (rsi > 60) opinion += "The asset is showing signs of exhaustion on the RSI, making this a technically sound fading opportunity. ";
                else if (rsi < 30) opinion += "High Risk! You are shorting into a 'Sold Out' market. Expect sudden short-covering bounces that could trigger your stop prematurely. ";

                if (rr >= 2.5) opinion += `An aggressive ${rr}:1 R:R ratio provides great leverage over the market's expected move. `;
                if (risk < atr * 0.5) opinion += "Technically, your stop is too tight for current volatility levels. Consider widening it to the nearest structural pivot.";
            }

            setBlueprintVerdict({
                score: Math.min(10, Math.max(1, score)),
                comment: comment,
                suggestion: suggestion,
                detailedOpinion: opinion,
                status: status,
                rr: rr,
                stats: {
                    rsi: rsi.toFixed(1),
                    atr: atr.toFixed(2),
                    risk: risk.toFixed(2),
                    reward: reward.toFixed(2),
                    entry: entry.toFixed(2),
                    target: target.toFixed(2),
                    stop: stop.toFixed(2)
                },
                checklist: [
                    { label: 'Risk/Reward > 2.0', pass: rr >= 2 },
                    { label: isLong ? 'RSI Not Overbought' : 'RSI Not Oversold', pass: isLong ? rsi < 70 : rsi > 30 },
                    { label: 'Stop Loss outside ATR', pass: risk >= atr * 0.5 },
                    { label: 'Confluence Check', pass: score > 6 }
                ]
            });
            setIsJudging(false);
            setShowDetailedVerdict(false);
        }, 1500);
    };



    // Update chart type
    const updateChartType = (type) => {
        if (!chartRef.current) return;

        // Remove old series
        if (mainSeriesRef.current) {
            chartRef.current.removeSeries(mainSeriesRef.current);
        }

        let newSeries;
        if (type === 'candlestick') {
            newSeries = chartRef.current.addCandlestickSeries({
                upColor: '#22c55e',
                downColor: '#ef4444',
                borderUpColor: '#22c55e',
                borderDownColor: '#ef4444',
                wickUpColor: '#22c55e',
                wickDownColor: '#ef4444'
            });
        } else if (type === 'line') {
            newSeries = chartRef.current.addLineSeries({
                color: '#8b5cf6',
                lineWidth: 2
            });
        } else if (type === 'area') {
            newSeries = chartRef.current.addAreaSeries({
                topColor: 'rgba(139, 92, 246, 0.4)',
                bottomColor: 'rgba(139, 92, 246, 0.0)',
                lineColor: '#8b5cf6',
                lineWidth: 2
            });
        }

        mainSeriesRef.current = newSeries;

        // Reapply data if available
        if (chartData && chartData.length > 0) {
            if (type === 'candlestick') {
                newSeries.setData(chartData);
            } else {
                const lineData = chartData.map(d => ({
                    time: d.time,
                    value: d.close
                }));
                newSeries.setData(lineData);
            }
        }
    };

    // Handle chart type change
    useEffect(() => {
        if (chartRef.current && mainSeriesRef.current) {
            updateChartType(chartType);
        }
    }, [chartType]);

    // Fetch initial data
    const fetchInitialData = async () => {
        try {
            const response = await fetch(
                `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`
            );
            const data = await response.json();

            const formattedData = data.map(k => ({
                time: parseInt(k[0]) / 1000,
                open: parseFloat(k[1]),
                high: parseFloat(k[2]),
                low: parseFloat(k[3]),
                close: parseFloat(k[4]),
                volume: parseFloat(k[5])
            }));

            setChartData(formattedData);

            // Update chart
            if (mainSeriesRef.current) {
                if (chartType === 'candlestick') {
                    mainSeriesRef.current.setData(formattedData);
                } else {
                    const lineData = formattedData.map(d => ({
                        time: d.time,
                        value: d.close
                    }));
                    mainSeriesRef.current.setData(lineData);
                }
            }
            if (volumeSeriesRef.current) {
                const volumeData = formattedData.map(d => ({
                    time: d.time,
                    value: d.volume,
                    color: d.close >= d.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                }));
                volumeSeriesRef.current.setData(volumeData);
            }

            // Calculate price change
            if (formattedData.length >= 2) {
                const firstPrice = formattedData[0].open;
                const lastPrice = formattedData[formattedData.length - 1].close;
                const change = ((lastPrice - firstPrice) / firstPrice) * 100;
                setPriceChange(change);
                setCurrentPrice(lastPrice);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    // Connect WebSocket
    const connectWebSocket = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        try {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            if (apiBaseUrl === 'your_key_here' || !apiBaseUrl.startsWith('http')) {
                apiBaseUrl = 'http://localhost:8000';
            }
            const wsHost = apiBaseUrl.replace('http://', '').replace('https://', '');
            const wsUrl = `${wsProtocol}//${wsHost}/ws/prices`;

            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                ws.send(JSON.stringify({
                    type: 'subscribe_kline',
                    symbol: symbol.toLowerCase(),
                    interval: interval
                }));
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'kline_update' && message.symbol.toUpperCase() === symbol) {
                        const kline = message.kline;
                        const newCandle = {
                            time: parseInt(kline.T) / 1000,
                            open: parseFloat(kline.o),
                            high: parseFloat(kline.h),
                            low: parseFloat(kline.l),
                            close: parseFloat(kline.c),
                            volume: parseFloat(kline.v)
                        };

                        // Update chart
                        if (mainSeriesRef.current) {
                            if (chartType === 'candlestick') {
                                mainSeriesRef.current.update(newCandle);
                            } else {
                                mainSeriesRef.current.update({
                                    time: newCandle.time,
                                    value: newCandle.close
                                });
                            }
                        }
                        if (volumeSeriesRef.current) {
                            volumeSeriesRef.current.update({
                                time: newCandle.time,
                                value: newCandle.volume,
                                color: newCandle.close >= newCandle.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                            });
                        }

                        setCurrentPrice(newCandle.close);
                        setChartData(prev => {
                            const newData = [...prev];
                            const lastCandle = newData[newData.length - 1];
                            if (lastCandle && lastCandle.time === newCandle.time) {
                                newData[newData.length - 1] = newCandle;
                            } else {
                                newData.push(newCandle);
                                if (newData.length > 500) newData.shift();
                            }
                            return newData;
                        });
                    }
                } catch (error) {
                    console.error('WebSocket message error:', error);
                }
            };

            ws.onerror = (error) => console.error('WebSocket error:', error);
            ws.onclose = () => {
                console.log('WebSocket disconnected');
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
        }
    };

    // Disconnect WebSocket
    const disconnectWebSocket = () => {
        if (wsRef.current) {
            // Only send unsubscribe if the connection is actually open
            if (wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'unsubscribe_kline',
                    symbol: symbol.toLowerCase(),
                    interval: interval
                }));
            }
            wsRef.current.close();
            wsRef.current = null;
        }
    };

    // Handle symbol/interval change & Initial Load
    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            await fetchInitialData();
            if (isMounted && isStreaming) {
                connectWebSocket();
            }
        };

        init();

        // Cleanup on change or unmount
        return () => {
            isMounted = false;
            disconnectWebSocket();
        };
    }, [symbol, interval, isStreaming]);

    // Start/stop streaming
    const toggleStreaming = () => {
        setIsStreaming(prev => !prev);
    };

    // Calculate indicators
    useEffect(() => {
        if (chartData.length < 2) return;

        const indicators = {};

        if (selectedIndicators.ema9) indicators.ema9 = calculateEMA(chartData, 9);
        if (selectedIndicators.ema21) indicators.ema21 = calculateEMA(chartData, 21);
        if (selectedIndicators.ema50) indicators.ema50 = calculateEMA(chartData, 50);
        if (selectedIndicators.ema100) indicators.ema100 = calculateEMA(chartData, 100);
        if (selectedIndicators.ema200) indicators.ema200 = calculateEMA(chartData, 200);
        if (selectedIndicators.rsi) indicators.rsi = calculateRSI(chartData, 14);
        if (selectedIndicators.macd) {
            const macdData = calculateMACD(chartData);
            indicators.macd = macdData.macd;
            indicators.macdSignal = macdData.signal;
            indicators.macdHistogram = macdData.histogram;
        }
        if (selectedIndicators.bollingerBands) {
            const bbData = calculateBollingerBands(chartData, 20, 2);
            indicators.bbUpper = bbData.upper;
            indicators.bbMiddle = bbData.middle;
            indicators.bbLower = bbData.lower;
        }
        if (selectedIndicators.supportResistance) {
            const srData = calculateSupportResistance(chartData, 20);
            indicators.support = srData.support;
            indicators.resistance = srData.resistance;
        }
        if (selectedIndicators.atr) indicators.atr = calculateATR(chartData, 14);

        setCalculatedIndicators(indicators);
    }, [chartData, selectedIndicators]);

    // Update indicator lines and price lines on chart
    useEffect(() => {
        if (!chartRef.current || chartData.length === 0) return;

        // Clear existing indicator series
        Object.values(indicatorSeriesRefs.current).forEach(series => {
            if (Array.isArray(series)) {
                series.forEach(s => { if (s && chartRef.current) chartRef.current.removeSeries(s); });
            } else if (series && chartRef.current) {
                chartRef.current.removeSeries(series);
            }
        });
        indicatorSeriesRefs.current = {};

        // Clear existing price lines
        priceLineRefs.current.forEach(line => {
            if (line && mainSeriesRef.current) {
                mainSeriesRef.current.removePriceLine(line);
            }
        });
        priceLineRefs.current = [];

        // Add EMA lines
        const emaColors = {
            ema9: '#f59e0b',
            ema21: '#3b82f6',
            ema50: '#8b5cf6',
            ema100: '#ec4899',
            ema200: '#ef4444'
        };

        Object.keys(emaColors).forEach(emaKey => {
            if (selectedIndicators[emaKey] && calculatedIndicators[emaKey]) {
                const series = chartRef.current.addLineSeries({
                    color: emaColors[emaKey],
                    lineWidth: 2,
                    title: emaKey.toUpperCase()
                });
                const data = calculatedIndicators[emaKey].map((value, i) => ({
                    time: chartData[i].time,
                    value: value
                })).filter(d => d.value !== null);
                series.setData(data);
                indicatorSeriesRefs.current[emaKey] = series;
            }
        });

        // Add Bollinger Bands
        if (selectedIndicators.bollingerBands && calculatedIndicators.bbUpper) {
            ['bbUpper', 'bbMiddle', 'bbLower'].forEach((bb, idx) => {
                const series = chartRef.current.addLineSeries({
                    color: idx === 1 ? '#6366f1' : '#a78bfa',
                    lineWidth: idx === 1 ? 2 : 1,
                    lineStyle: idx === 1 ? 0 : 2,
                    title: bb.toUpperCase()
                });
                const data = calculatedIndicators[bb].map((value, i) => ({
                    time: chartData[i].time,
                    value: value
                })).filter(d => d.value !== null);
                series.setData(data);
                indicatorSeriesRefs.current[bb] = series;
            });
        }

        // Add Support/Resistance lines - Elite & Intelligent
        if (selectedIndicators.supportResistance && mainSeriesRef.current) {
            if (calculatedIndicators.support) {
                calculatedIndicators.support.forEach((level, idx) => {
                    const line = mainSeriesRef.current.createPriceLine({
                        price: level.price,
                        color: level.isFlipped ? '#10b981' : '#22c55e', // Emerald for flip, Green for direct
                        lineWidth: 3,
                        lineStyle: 0, // Solid for prominence
                        axisLabelVisible: true,
                        title: `${level.label} ${idx + 1}`
                    });
                    priceLineRefs.current.push(line);
                });
            }
            if (calculatedIndicators.resistance) {
                calculatedIndicators.resistance.forEach((level, idx) => {
                    const line = mainSeriesRef.current.createPriceLine({
                        price: level.price,
                        color: level.isFlipped ? '#f43f5e' : '#ef4444', // Rose for flip, Red for direct
                        lineWidth: 3,
                        lineStyle: 0, // Solid for prominence
                        axisLabelVisible: true,
                        title: `${level.label} ${idx + 1}`
                    });
                    priceLineRefs.current.push(line);
                });
            }
        }

        // Draw AI Pattern if active
        if (activeAiPattern && chartData.length > 0) {
            const timeIncrement = interval === '1d' ? 86400 : interval === '1h' ? 3600 : interval === '15m' ? 900 : 60;
            const baseTime = activeAiPattern.baseTime;

            // Draw main pattern path
            const projectionPoints = activeAiPattern.data.map((p, idx) => ({
                time: baseTime + (idx * timeIncrement),
                value: p.y
            }));

            const patternSeries = chartRef.current.addLineSeries({
                color: activeAiPattern.direction === 'bullish' ? '#22c55e' :
                    activeAiPattern.direction === 'bearish' ? '#ef4444' : '#6366f1',
                lineWidth: 3,
                lineStyle: 0,
                lastValueVisible: true,
                priceLineVisible: false,
                title: activeAiPattern.pattern_name.replace(/_/g, ' ').toUpperCase()
            });
            patternSeries.setData(projectionPoints);
            indicatorSeriesRefs.current.ai_pattern = patternSeries;

            // Trendlines
            if (activeAiPattern.trendlines) {
                indicatorSeriesRefs.current.ai_trendlines = [];
                activeAiPattern.trendlines.forEach(tl => {
                    const lineSeries = chartRef.current.addLineSeries({
                        color: tl.color || '#94a3b8',
                        lineWidth: 2,
                        lineStyle: 2,
                        lastValueVisible: false,
                        priceLineVisible: false,
                    });

                    const lineData = [
                        { time: baseTime + (tl.x1 * timeIncrement), value: tl.y1 },
                        { time: baseTime + (tl.x2 * timeIncrement), value: tl.y2 }
                    ];
                    lineSeries.setData(lineData);
                    indicatorSeriesRefs.current.ai_trendlines.push(lineSeries);
                });
            }

            // Markers
            if (activeAiPattern.annotations) {
                const markers = activeAiPattern.annotations.map(ann => ({
                    time: baseTime + (ann.x * timeIncrement),
                    position: ann.type === 'peak' ? 'aboveBar' : 'belowBar',
                    color: ann.type === 'peak' ? '#ef4444' : '#22c55e',
                    shape: ann.type === 'peak' ? 'arrowDown' : 'arrowUp',
                    text: ann.label
                }));
                patternSeries.setMarkers(markers);
            }
        }
    }, [calculatedIndicators, selectedIndicators, chartData, activeAiPattern]);

    // Generate scenario simulation - Instant display with realistic entry/exit
    const generateScenario = (type) => {
        if (!chartData || chartData.length < 10) {
            alert('Not enough data to generate scenario. Please start streaming first.');
            return;
        }

        const lastPrice = currentPrice;
        const lastCandle = chartData[chartData.length - 1];
        const avgVolatility = calculatedIndicators.atr ? getCurrentValue(calculatedIndicators.atr) : lastPrice * 0.02;

        // Smart Volatility Engine
        const volIntensity = avgVolatility / lastPrice;
        const isHyper = volIntensity > 0.03; // Hyper-volatile if ATR > 3% of price

        const targetMult = isHyper ? 5.5 : 3.5;
        const stepAdjustment = isHyper ? 0.75 : 1.25;

        let scenario = null;
        let projectionPoints = [];

        // Helper to generate a realistic projected path
        const generatePath = (entryPrice, targetPrice, steps = 25, startTime = null) => {
            const path = [];
            const totalDiff = targetPrice - entryPrice;
            const baseTime = startTime || lastCandle.time;
            const timeIncrement = interval === '1d' ? 86400 : interval === '1h' ? 3600 : 60;

            for (let i = 0; i <= steps; i++) {
                const progress = i / steps;
                // Explosive curve for hyper coins
                const easeProgress = isHyper
                    ? Math.pow(progress, 1.4)
                    : 1 - Math.pow(1 - progress, 2);

                const spikeFactor = isHyper ? (Math.random() > 0.8 ? 2 : 1) : 1;
                const noise = Math.sin(progress * Math.PI * 3) * 0.4 * spikeFactor * avgVolatility;

                path.push({
                    time: baseTime + (i * timeIncrement),
                    value: entryPrice + (totalDiff * easeProgress) + noise
                });
            }
            return path;
        };

        switch (type) {
            case 'long':
                const supportLevel = calculatedIndicators.support?.[0]?.price || lastPrice * 0.98;
                const longTarget = supportLevel + (Math.max(avgVolatility * targetMult, supportLevel * 0.07));
                const longStop = supportLevel - (Math.max(avgVolatility * 1.5, supportLevel * 0.03));

                const toSupport = generatePath(lastPrice, supportLevel, Math.floor(10 * stepAdjustment));
                const toTarget = generatePath(supportLevel, longTarget, Math.floor(20 * stepAdjustment), toSupport[toSupport.length - 1].time);
                projectionPoints = [...toSupport, ...toTarget.slice(1)];

                scenario = {
                    type: isHyper ? 'Hyper-Bullish Long' : 'Long Support',
                    entryPrice: supportLevel,
                    targetPrice: longTarget,
                    stopLoss: longStop,
                    description: isHyper
                        ? 'Explosive volatility detected. Catching a high-speed target bounce.'
                        : 'Strong recovery expected. High probability bounce from support.'
                };
                break;


            case 'short':
                const resistanceLevel = calculatedIndicators.resistance?.[0]?.price || lastPrice * 1.02;
                const shortTarget = resistanceLevel - (Math.max(avgVolatility * targetMult, resistanceLevel * 0.07));
                const shortStop = resistanceLevel + (Math.max(avgVolatility * 1.5, resistanceLevel * 0.03));

                const toResistance = generatePath(lastPrice, resistanceLevel, Math.floor(10 * stepAdjustment));
                const toShortTarget = generatePath(resistanceLevel, shortTarget, Math.floor(20 * stepAdjustment), toResistance[toResistance.length - 1].time);
                projectionPoints = [...toResistance, ...toShortTarget.slice(1)];

                scenario = {
                    type: isHyper ? 'Panic Flush Short' : 'Short Resistance',
                    entryPrice: resistanceLevel,
                    targetPrice: shortTarget,
                    stopLoss: shortStop,
                    description: isHyper
                        ? 'Extreme overextension. Expecting a rapid, high-intensity flush.'
                        : 'Overextended price reaching resistance. Expecting sharp rejection.'
                };
                break;

            case 'breakout':
                const bRes = calculatedIndicators.resistance?.[0]?.price || lastPrice * 1.015;
                const bTarget = bRes + (Math.max(avgVolatility * (targetMult + 2), bRes * 0.14));
                const bStop = bRes - (Math.max(avgVolatility * 1.5, bRes * 0.04));

                const toBPoint = generatePath(lastPrice, bRes, Math.floor(12 * stepAdjustment));
                const bMove = generatePath(bRes, bTarget, Math.floor(18 * stepAdjustment), toBPoint[toBPoint.length - 1].time);
                projectionPoints = [...toBPoint, ...bMove.slice(1)];

                scenario = {
                    type: isHyper ? 'Parabolic Breakout' : 'Major Breakout',
                    entryPrice: bRes,
                    targetPrice: bTarget,
                    stopLoss: bStop,
                    description: 'Explosive momentum breakout. Projected parabolic expansion after structural break.'
                };
                break;

            case 'breakdown':
                const bSupp = calculatedIndicators.support?.[0]?.price || lastPrice * 0.985;
                const bdTarget = bSupp - (Math.max(avgVolatility * (targetMult + 2), bSupp * 0.14));
                const bdStop = bSupp + (Math.max(avgVolatility * 1.5, bSupp * 0.04));

                const toBDPoint = generatePath(lastPrice, bSupp, Math.floor(12 * stepAdjustment));
                const bdMove = generatePath(bSupp, bdTarget, Math.floor(18 * stepAdjustment), toBDPoint[toBDPoint.length - 1].time);
                projectionPoints = [...toBDPoint, ...bdMove.slice(1)];

                scenario = {
                    type: isHyper ? 'Flash Crash Breakdown' : 'Major Breakdown',
                    entryPrice: bSupp,
                    targetPrice: bdTarget,
                    stopLoss: bdStop,
                    description: 'Critical support flush. Internal indicators suggest a high-speed trend collapse.'
                };
                break;

            case 'mean-reversion':
                const mBB = calculatedIndicators.bbMiddle ? getCurrentValue(calculatedIndicators.bbMiddle) : lastPrice;
                const isAbove = lastPrice > mBB;
                const mTarget = isAbove
                    ? (calculatedIndicators.bbLower ? getCurrentValue(calculatedIndicators.bbLower) : lastPrice * (1 - volIntensity * 3))
                    : (calculatedIndicators.bbUpper ? getCurrentValue(calculatedIndicators.bbUpper) : lastPrice * (1 + volIntensity * 3));

                const mStop = isAbove ? lastPrice * (1 + volIntensity) : lastPrice * (1 - volIntensity);

                projectionPoints = generatePath(lastPrice, mTarget, Math.floor(25 * stepAdjustment));

                scenario = {
                    type: 'Full Cycle Reversion',
                    entryPrice: lastPrice,
                    targetPrice: mTarget,
                    stopLoss: mStop,
                    description: `Extreme price deviation. Expecting a high-speed return to equilibrium.`
                };
                break;
        }

        if (scenario) {
            const riskReward = Math.abs((scenario.targetPrice - scenario.entryPrice) / (scenario.entryPrice - scenario.stopLoss));
            scenario.riskReward = riskReward.toFixed(2);
            scenario.potentialGain = (((scenario.targetPrice - scenario.entryPrice) / scenario.entryPrice) * 100).toFixed(2);
            scenario.potentialLoss = (((scenario.entryPrice - scenario.stopLoss) / scenario.entryPrice) * 100).toFixed(2);

            // Clear previous simulation
            if (activeAiPattern) setActiveAiPattern(null);
            if (projectionSeries && chartRef.current) {
                chartRef.current.removeSeries(projectionSeries);
            }

            // Clear existing price lines
            priceLineRefs.current.forEach(line => {
                try { mainSeriesRef.current.removePriceLine(line); } catch (e) { }
            });
            priceLineRefs.current = [];

            // Draw entry, target, and stop lines
            if (mainSeriesRef.current) {
                const entryLine = mainSeriesRef.current.createPriceLine({
                    price: scenario.entryPrice,
                    color: '#3b82f6',
                    lineWidth: 2,
                    lineStyle: 0,
                    axisLabelVisible: true,
                    title: 'Entry'
                });
                const targetLine = mainSeriesRef.current.createPriceLine({
                    price: scenario.targetPrice,
                    color: '#22c55e',
                    lineWidth: 2,
                    lineStyle: 0,
                    axisLabelVisible: true,
                    title: 'Target'
                });
                const stopLine = mainSeriesRef.current.createPriceLine({
                    price: scenario.stopLoss,
                    color: '#ef4444',
                    lineWidth: 2,
                    lineStyle: 0,
                    axisLabelVisible: true,
                    title: 'Stop'
                });
                priceLineRefs.current.push(entryLine, targetLine, stopLine);
            }

            // Create projection path (instant display)
            if (chartRef.current) {
                const newProjSeries = chartRef.current.addLineSeries({
                    color: '#f59e0b',
                    lineWidth: 3,
                    lineStyle: 2, // Dashed
                    lastValueVisible: false,
                    priceLineVisible: false,
                });
                newProjSeries.setData(projectionPoints);
                setProjectionSeries(newProjSeries);
            }

            setScenarioData(scenario);
            setSimulationActive(true);
            setSimulationMode(type);
        }
    };

    // AI Pattern Generation - Draw identified patterns on the chart
    const handleAIPattern = (pattern) => {
        if (!pattern || !pattern.data || !chartData.length) return;

        const lastCandle = chartData[chartData.length - 1];
        const baseTime = lastCandle.time;

        // Set active pattern to draw in useEffect
        setActiveAiPattern({ ...pattern, baseTime });

        // Zoom the chart to see the pattern ONLY when it is first generated
        setTimeout(() => {
            if (chartRef.current && chartData.length > 0) {
                chartRef.current.timeScale().setVisibleLogicalRange({
                    from: chartData.length - 20,
                    to: chartData.length + pattern.data.length + 10
                });
            }
        }, 100);

        setScenarioData({
            type: pattern.pattern_name.replace(/_/g, ' ').toUpperCase(),
            description: pattern.description,
            isAIPattern: true,
            successRate: pattern.success_rate,
            tradingTips: pattern.trading_tips,
            entryPrice: pattern.data[0].y,
            targetPrice: pattern.data[pattern.data.length - 1].y,
            stopLoss: pattern.data[0].y * 0.95
        });
        setSimulationActive(true);
        setSimulationMode('ai-pattern');
    };

    // Reset Chart View - Clear all visual distractions
    const handleResetChart = () => {
        // Reset indicators to all false
        setSelectedIndicators({
            ema9: false,
            ema21: false,
            ema50: false,
            ema100: false,
            ema200: false,
            rsi: false,
            macd: false,
            bollingerBands: false,
            supportResistance: false,
            atr: false
        });

        // Clear simulation and pattern states
        setSimulationActive(false);
        setScenarioData(null);
        setSimulationMode(null);
        setActiveAiPattern(null);

        // Force clear all price lines and artifacts from the chart object
        if (priceLineRefs.current.length > 0 && mainSeriesRef.current) {
            priceLineRefs.current.forEach(line => {
                try { mainSeriesRef.current.removePriceLine(line); } catch (e) { }
            });
            priceLineRefs.current = [];
        }

        // Remove any extra series (like projections or indicators)
        Object.values(indicatorSeriesRefs.current).forEach(series => {
            if (Array.isArray(series)) {
                series.forEach(s => { if (s && chartRef.current) try { chartRef.current.removeSeries(s); } catch (e) { } });
            } else if (series && chartRef.current) {
                try { chartRef.current.removeSeries(series); } catch (e) { }
            }
        });
        indicatorSeriesRefs.current = {};

        if (projectionSeries && chartRef.current) {
            try { chartRef.current.removeSeries(projectionSeries); } catch (e) { }
            setProjectionSeries(null);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnectWebSocket();
        };
    }, []);

    return (
        <div className={`h-full w-full flex flex-col overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#16161e] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            {/* --- Premium Top Header --- */}
            <header className={`z-[70] transition-all duration-500 relative border-b ${theme === 'dark' ? 'bg-[#1e2030]/80 border-slate-700/50' : 'bg-white/80 border-slate-200'} backdrop-blur-md`}>
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 md:px-8 py-3 md:py-4 gap-4">
                    {/* Left: Ticker & Timeframe */}
                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-2xl shadow-inner ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-slate-100'}`}>
                                <TrendingUp className="text-purple-500" size={28} />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 relative" ref={tickerMenuRef}>
                                    <button
                                        onClick={() => setIsTickerMenuOpen(!isTickerMenuOpen)}
                                        className={`flex items-center gap-2 group transition-all rounded-xl px-2 py-1 -ml-2 ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                                    >
                                        <span className={`transition-all ${theme === 'dark' ? 'text-white group-hover:text-purple-400' : 'text-slate-900 group-hover:text-purple-600'}`}
                                            style={{ fontWeight: 800, fontSize: isMobile ? '1.25rem' : '1.5rem', letterSpacing: '-0.02em', fontFamily: "'Inter', system-ui, sans-serif" }}>
                                            {symbol.replace('USDT', '')}
                                        </span>
                                        <ChevronDown size={isMobile ? 18 : 22} className={`transition-transform duration-300 ${isTickerMenuOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                                    </button>

                                    {/* Premium Custom Dropdown */}
                                    {isTickerMenuOpen && (
                                        <div className={`absolute top-full left-0 mt-2 w-72 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300 z-[100] ${theme === 'dark' ? 'bg-[#1e2030]/95 border-slate-700/50' : 'bg-white/95 border-slate-200 shadow-slate-200/50'}`}>
                                            <div className="p-3 border-b border-slate-700/30">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Search or enter ticker..."
                                                        value={tickerSearch}
                                                        onChange={(e) => setTickerSearch(e.target.value.toUpperCase())}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && tickerSearch) {
                                                                const finalTicker = tickerSearch.endsWith('USDT') ? tickerSearch : `${tickerSearch}USDT`;
                                                                setSymbol(finalTicker);
                                                                setIsTickerMenuOpen(false);
                                                                setTickerSearch('');
                                                            }
                                                        }}
                                                        className={`w-full px-4 py-2 rounded-xl text-sm font-bold border outline-none transition-all ${theme === 'dark' ? 'bg-[#16161e] border-slate-700 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-400'}`}
                                                        autoFocus
                                                    />
                                                    <div className="absolute right-3 top-2.5 opacity-40">
                                                        <Search size={14} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-2 max-h-[350px] overflow-y-auto custom-scrollbar grid grid-cols-1 gap-1">
                                                {filteredOptions.length > 0 ? (
                                                    filteredOptions.map(token => (
                                                        <button
                                                            key={token.symbol}
                                                            onClick={() => {
                                                                setSymbol(token.symbol);
                                                                setIsTickerMenuOpen(false);
                                                                setTickerSearch('');
                                                            }}
                                                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${symbol === token.symbol
                                                                ? (theme === 'dark' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-purple-50 text-purple-600 border border-purple-100')
                                                                : (theme === 'dark' ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50')
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                                                    {token.symbol.substring(0, 1)}
                                                                </div>
                                                                <div className="flex flex-col items-start">
                                                                    <span className="text-sm font-bold">{token.symbol.replace('USDT', '')}</span>
                                                                    <span className={`text-[10px] opacity-60 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{token.name}</span>
                                                                </div>
                                                            </div>
                                                            {symbol === token.symbol && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            const finalTicker = tickerSearch.endsWith('USDT') ? tickerSearch : `${tickerSearch}USDT`;
                                                            setSymbol(finalTicker);
                                                            setIsTickerMenuOpen(false);
                                                            setTickerSearch('');
                                                        }}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${theme === 'dark' ? 'text-purple-400 bg-purple-600/10 hover:bg-purple-600/20' : 'text-purple-600 bg-purple-50 hover:bg-purple-100'}`}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20">
                                                            <Plus size={16} />
                                                        </div>
                                                        <div className="flex flex-col items-start">
                                                            <span className="text-sm font-bold">Use "{tickerSearch}"</span>
                                                            <span className="text-[10px] opacity-60 font-medium">Try any Binance pair</span>
                                                        </div>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                                        {interval}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-lg font-mono font-bold ${priceChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span className={`text-xs font-black ${priceChange >= 0 ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Timeframe Switcher */}
                        <div className={`hidden sm:flex gap-1 rounded-xl p-1 ${theme === 'dark' ? 'bg-[#16161e]/50' : 'bg-slate-100'}`}>
                            {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                                <button
                                    key={tf}
                                    onClick={() => setInterval(tf)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${interval === tf
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                        : 'text-slate-500 hover:text-purple-500'
                                        }`}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>

                        {/* Mobile Timeframe Dropdown */}
                        <div className="sm:hidden relative flex items-center">
                            <Clock size={16} className="absolute left-3 text-slate-500 pointer-events-none" />
                            <select
                                value={interval}
                                onChange={(e) => setInterval(e.target.value)}
                                className={`pl-9 pr-4 py-2.5 rounded-xl border text-sm font-black appearance-none outline-none transition-all shadow-xl ${theme === 'dark'
                                    ? 'bg-[#1e2030] border-slate-700/50 text-slate-300 focus:border-purple-500'
                                    : 'bg-white border-slate-200 text-slate-600 focus:border-purple-600'
                                    }`}
                            >
                                {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                                    <option key={tf} value={tf}>{tf.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-2">
                        {/* Reset Chart Layout */}
                        <button
                            onClick={handleResetChart}
                            className={`hidden sm:flex p-2.5 rounded-xl border transition-all ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 text-slate-400 hover:text-amber-500' : 'bg-white border-slate-200 text-slate-600 hover:text-amber-600'
                                }`}
                            title="Reset Chart Layout"
                        >
                            <RotateCcw size={20} />
                        </button>
                        {/* Chart Type Toggle */}
                        <div className={`flex gap-1 rounded-xl p-1 ${theme === 'dark' ? 'bg-[#16161e]/50' : 'bg-slate-100'}`}>
                            {[
                                { type: 'candlestick', icon: BarChart3 },
                                { type: 'line', icon: Activity },
                                { type: 'area', icon: Layers }
                            ].map(({ type, icon: Icon }) => (
                                <button
                                    key={type}
                                    onClick={() => setChartType(type)}
                                    className={`p-2 rounded-lg transition-all ${chartType === type
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'text-slate-500 hover:text-purple-500'
                                        }`}
                                >
                                    <Icon size={18} />
                                </button>
                            ))}
                        </div>

                        <div className="h-8 w-[1px] bg-slate-700/30 mx-1 hidden md:block" />

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setFocusMode(!focusMode)}
                                className={`p-2.5 rounded-xl border transition-all ${focusMode
                                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg'
                                    : theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-purple-600'
                                    }`}
                            >
                                {focusMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            </button>

                            <button
                                onClick={() => setShowAIChat(!showAIChat)}
                                className={`px-4 py-2.5 rounded-xl border font-bold text-sm flex items-center gap-2 transition-all ${showAIChat
                                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg'
                                    : theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-purple-600'
                                    }`}
                            >
                                <MessageSquare size={18} />
                                <span className="hidden lg:inline">Ask AI</span>
                            </button>

                            <button
                                onClick={toggleStreaming}
                                className={`px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-xl ${isStreaming
                                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    }`}
                            >
                                {isStreaming ? (
                                    <><div className="w-2 h-2 bg-white rounded-full animate-pulse" /><span>LIVE</span></>
                                ) : (
                                    <><PlayCircle size={18} /><span>START</span></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Main Workspace --- */}
            <div className="flex-1 flex flex-row overflow-hidden relative">
                {/* Left Sidebar: Indicators & Simulator */}
                <aside
                    className={`absolute md:relative z-[60] h-full transition-all duration-500 ease-in-out border-r ${focusMode
                        ? '-translate-x-full md:w-0 border-none'
                        : isSidebarCollapsed
                            ? '-translate-x-full md:w-0 border-none'
                            : 'translate-x-0 w-[280px] md:w-[320px]'
                        } ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50' : 'bg-white/95 backdrop-blur-xl border-slate-200'}`}
                >
                    {/* Persistent Sidebar Toggle - Pulls into view even when collapsed */}
                    {!focusMode && (
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className={`absolute z-[70] transition-all duration-500 shadow-2xl active:scale-95 flex items-center justify-center border ${isSidebarCollapsed
                                ? 'right-[-40px] rounded-r-2xl w-10 h-14 top-24'
                                : 'right-[-16px] rounded-full w-8 h-8 top-6'
                                } ${theme === 'dark'
                                    ? 'bg-[#1e2030] border-slate-700 text-purple-400 hover:text-purple-300'
                                    : 'bg-white border-slate-200 text-purple-600 hover:text-purple-500 shadow-lg'
                                }`}
                            title={isSidebarCollapsed ? "Expand Tools" : "Collapse Sidebar"}
                        >
                            {isSidebarCollapsed ? <ChevronRight size={22} className="ml-1" /> : <ChevronLeft size={18} />}
                        </button>
                    )}

                    {!isSidebarCollapsed && (
                        <div className="h-full flex flex-col p-4 md:p-6 space-y-6 overflow-y-auto no-scrollbar">
                            {/* Indicators Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Technical Analysis</h3>
                                    <Sparkles size={14} className="text-purple-500 animate-pulse" />
                                </div>

                                <div className="space-y-4">
                                    {/* EMA Group Card */}
                                    <div className={`p-1.5 rounded-3xl border transition-all duration-300 ${theme === 'dark' ? 'bg-[#16161e]/60 border-slate-700/50 hover:bg-[#16161e]/80' : 'bg-white border-slate-200/60 shadow-sm hover:shadow-md'}`}>
                                        <div className="px-4 py-3 mb-1 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Activity size={15} className="text-amber-500" />
                                                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Moving Averages</span>
                                            </div>
                                            <div className="w-8 h-1 bg-slate-700/20 rounded-full" />
                                        </div>
                                        <div className="space-y-1">
                                            {['ema9', 'ema21', 'ema50', 'ema100', 'ema200'].map(key => (
                                                <button
                                                    key={key}
                                                    onClick={() => setSelectedIndicators(prev => ({ ...prev, [key]: !prev[key] }))}
                                                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-all ${selectedIndicators[key] ? (theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600 shadow-sm') : 'hover:bg-purple-500/5 text-slate-500'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${key === 'ema9' ? 'bg-amber-500' : key === 'ema21' ? 'bg-blue-500' : key === 'ema50' ? 'bg-purple-500' : key === 'ema100' ? 'bg-pink-500' : 'bg-red-500'}`} />
                                                        <span className="text-[11px] font-bold uppercase">{key.replace('ema', 'EMA ')}</span>
                                                    </div>
                                                    {selectedIndicators[key] ? <Eye size={13} className="opacity-80" /> : <EyeOff size={13} className="opacity-30" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Advanced Indicators Grid */}
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { key: 'rsi', label: 'RSI (14)', icon: Activity },
                                            { key: 'macd', label: 'MACD', icon: BarChart3 },
                                            { key: 'bollingerBands', label: 'Bollinger', icon: Layers },
                                            { key: 'supportResistance', label: 'S/R Levels', icon: Minus }
                                        ].map(ind => (
                                            <button
                                                key={ind.key}
                                                onClick={() => setSelectedIndicators(prev => ({ ...prev, [ind.key]: !prev[ind.key] }))}
                                                className={`px-4 py-3 rounded-2xl border flex items-center justify-between transition-all ${selectedIndicators[ind.key]
                                                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20 active:scale-[0.98]'
                                                    : theme === 'dark' ? 'bg-[#16161e] border-slate-700/50 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:shadow-md'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <ind.icon size={16} />
                                                    <span className="text-[11px] font-black uppercase tracking-wider">{ind.label}</span>
                                                </div>
                                                {selectedIndicators[ind.key] ? <Eye size={16} /> : <Plus size={16} className="opacity-40" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Simulator Section */}
                            <div className="space-y-4 pt-4 border-t border-slate-700/20">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Trade Simulator</h3>
                                    <FastForward size={14} className="text-amber-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { type: 'long', label: 'Long', icon: TrendingUp, color: 'emerald' },
                                        { type: 'short', label: 'Short', icon: TrendingDown, color: 'rose' },
                                        { type: 'breakout', label: 'Breakout', icon: Zap, color: 'amber' },
                                        { type: 'mean-reversion', label: 'Revert', icon: Activity, color: 'purple' }
                                    ].map(sim => (
                                        <button
                                            key={sim.type}
                                            onClick={() => generateScenario(sim.type)}
                                            className={`flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border transition-all ${simulationMode === sim.type
                                                ? `bg-${sim.color}-500 border-${sim.color}-400 text-white shadow-lg scale-[1.02]`
                                                : theme === 'dark' ? 'bg-[#16161e] border-slate-700/50 text-slate-400 hover:border-slate-500 hover:bg-slate-700/30' : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200'
                                                }`}
                                        >
                                            <sim.icon size={18} />
                                            <span className="text-[9px] font-black uppercase tracking-tighter">{sim.label}</span>
                                        </button>
                                    ))}
                                    {/* Blueprint Mode Button */}
                                    <button
                                        onClick={toggleBlueprintMode}
                                        className={`col-span-2 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${isBlueprintMode
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                            : theme === 'dark' ? 'bg-[#16161e] border-slate-700/50 text-blue-400 hover:border-blue-500' : 'bg-blue-50 border-blue-100 text-blue-600 hover:border-blue-300'
                                            }`}
                                    >
                                        <Target size={20} className={isBlueprintMode ? 'animate-spin-slow' : ''} />
                                        <span className="text-[11px] font-bold uppercase tracking-widest">{isBlueprintMode ? 'STOP PLANNING' : 'JUDGE MY TRADE'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Active Scenario Insights */}
                            {simulationActive && scenarioData && (
                                <div className={`mt-auto p-5 rounded-3xl border animate-in slide-in-from-bottom-4 duration-500 ${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                            <h4 className="text-xs font-black uppercase text-purple-500">{scenarioData.type}</h4>
                                        </div>
                                        <button onClick={() => setSimulationActive(false)} className="text-slate-400 hover:text-rose-500"><X size={16} /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[9px] uppercase font-bold text-slate-400">Target</div>
                                            <div className="text-sm font-black text-emerald-500">${scenarioData.targetPrice.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase font-bold text-slate-400">Risk/Reward</div>
                                            <div className="text-sm font-black text-purple-600">{scenarioData.riskReward}:1</div>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-[11px] leading-relaxed text-slate-500 italic">
                                        {scenarioData.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </aside>

                {/* Center Content: Chart Area */}
                <main className={`flex-1 relative min-h-0 ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-slate-50'}`}>
                    {/* OHLC Overlay (Glassmorphism) */}
                    <div className={`absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-auto z-20 pointer-events-none transition-all duration-700`}>
                        <div className={`backdrop-blur-md rounded-2xl md:rounded-3xl border overflow-hidden shadow-2xl pointer-events-auto ${theme === 'dark' ? 'bg-[#1e2030]/60 border-white/5 shadow-black/40' : 'bg-white/60 border-white shadow-slate-200/50'}`}>
                            <div className="flex items-center flex-wrap md:flex-nowrap justify-between md:justify-start gap-y-2 gap-x-4 md:gap-8 px-4 md:px-6 py-3 md:py-4">
                                {[
                                    { label: 'O', val: chartData[chartData.length - 1]?.open, col: theme === 'dark' ? 'text-slate-300' : 'text-slate-500' },
                                    { label: 'H', val: chartData[chartData.length - 1]?.high, col: 'text-emerald-500' },
                                    { label: 'L', val: chartData[chartData.length - 1]?.low, col: 'text-rose-500' },
                                    { label: 'C', val: chartData[chartData.length - 1]?.close, col: 'text-purple-500' }
                                ].map(ohlc => (
                                    <div key={ohlc.label} className="flex flex-col">
                                        <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-tighter mb-0.5">{ohlc.label}</span>
                                        <span className={`text-[12px] md:text-[15px] font-mono font-black ${ohlc.col} leading-none`}>
                                            ${ohlc.val?.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Blueprint Mode Instructions / HUD */}
                    {isBlueprintMode && (
                        <div className="absolute top-24 md:top-28 left-4 right-4 md:left-6 md:right-auto z-[150] pointer-events-none animate-in slide-in-from-top-4 duration-500">
                            <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl pointer-events-auto ${theme === 'dark' ? 'bg-blue-600/20 border-blue-500/50' : 'bg-blue-50 border-blue-200'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                                        <Crosshair size={24} className="animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-1">Trade Blueprint</h4>
                                        <p className={`text-[11px] font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {blueprintStep === 'entry' ? 'CLICK ON CHART TO SET ENTRY PRICE' :
                                                blueprintStep === 'target' ? 'SET PROFIT TARGET (WHERE DO WE EXIT?)' :
                                                    blueprintStep === 'stop' ? 'SET STOP LOSS (PROTECT YOUR CAPITAL)' :
                                                        'PLAN COMPLETE. READY FOR ANALYSIS.'}
                                        </p>
                                    </div>
                                    {!blueprintStep && (
                                        <button
                                            onClick={judgeTrade}
                                            disabled={isJudging}
                                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-95 flex items-center gap-2"
                                        >
                                            {isJudging ? <Zap size={14} className="animate-spin" /> : <Brain size={14} />}
                                            {isJudging ? 'ANALYZING...' : 'GET VERDICT'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Verdict Modal/Panel */}
                    {blueprintVerdict && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] max-w-sm w-full p-1 animate-in zoom-in-95 duration-500">
                            <div className={`rounded-[32px] border-4 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] ${theme === 'dark' ? 'bg-[#1e2030] border-slate-800' : 'bg-white border-slate-100'}`}>
                                <div className={`p-8 text-center relative overflow-hidden ${blueprintVerdict.status === 'bullish' ? 'bg-emerald-500/10' : blueprintVerdict.status === 'bearish' ? 'bg-rose-500/10' : 'bg-purple-500/10'}`}>
                                    {/* High-fidelity Glass Card UI */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 italic">Trade Intelligence Report</h3>

                                    <div className="relative inline-block mb-6">
                                        <div className="text-6xl font-black text-slate-100 flex items-baseline justify-center">
                                            {blueprintVerdict.score}
                                            <span className="text-xl text-slate-500">/10</span>
                                        </div>
                                        <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${blueprintVerdict.status === 'bullish' ? 'bg-emerald-500 text-white' : blueprintVerdict.status === 'bearish' ? 'bg-rose-500 text-white' : 'bg-purple-500 text-white'}`}>
                                            {blueprintVerdict.score > 7 ? 'High Conviction' : blueprintVerdict.score > 4 ? 'Moderate Bias' : 'Low Probability'}
                                        </div>
                                    </div>

                                    <div className="space-y-4 text-left">
                                        {showDetailedVerdict ? (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                                {/* Checklist */}
                                                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                                                    <h4 className="text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">Technical Checklist</h4>
                                                    <div className="space-y-2">
                                                        {blueprintVerdict.checklist.map((item, i) => (
                                                            <div key={i} className="flex items-center justify-between">
                                                                <span className="text-[10px] font-bold text-slate-400">{item.label}</span>
                                                                {item.pass ? <CheckCircle2 size={12} className="text-emerald-500" /> : <X size={12} className="text-rose-500" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                                                        <div className="text-[8px] font-black text-slate-500 uppercase">RSI (14)</div>
                                                        <div className="text-xs font-black text-purple-500">{blueprintVerdict.stats.rsi}</div>
                                                    </div>
                                                    <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                                                        <div className="text-[8px] font-black text-slate-500 uppercase">R:R Ratio</div>
                                                        <div className="text-xs font-black text-emerald-500 text-center">{blueprintVerdict.rr}:1</div>
                                                    </div>
                                                </div>

                                                {/* Detailed Opinion Narrative */}
                                                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Brain size={14} className="text-blue-500" />
                                                        <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Nunno's Deep Logic</span>
                                                    </div>
                                                    <p className={`text-[11px] leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                                                        {blueprintVerdict.detailedOpinion}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => setShowDetailedVerdict(false)}
                                                    className="w-full py-2 text-[9px] font-black uppercase tracking-tighter text-blue-500 hover:text-blue-400 transition-colors"
                                                >
                                                    ← Back to Verdict
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Target size={14} className="text-blue-500" />
                                                        <span className="text-[10px] font-black uppercase text-slate-500">Analysis Verdict</span>
                                                    </div>
                                                    <p className={`text-xs font-bold leading-relaxed ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                                                        {blueprintVerdict.comment}
                                                    </p>
                                                </div>

                                                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertTriangle size={14} className="text-amber-500" />
                                                        <span className="text-[10px] font-black uppercase text-slate-500">AI Warning</span>
                                                    </div>
                                                    <p className={`text-xs font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                                        {blueprintVerdict.suggestion}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => setShowDetailedVerdict(true)}
                                                    className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    View Detailed Report
                                                </button>
                                            </>
                                        )}

                                        <div className="grid grid-cols-2 gap-3 pt-4">
                                            <button
                                                onClick={() => {
                                                    setBlueprintVerdict(null);
                                                    setShowDetailedVerdict(false);
                                                }}
                                                className={`py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'}`}
                                            >
                                                CLOSE
                                            </button>
                                            <button
                                                onClick={toggleBlueprintMode}
                                                className="py-3 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <RotateCcw size={14} />
                                                RESET
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chart Container */}
                    <div
                        ref={chartContainerRef}
                        className={`w-full h-full relative z-10 ${isBlueprintMode ? 'cursor-crosshair' : ''}`}
                    />

                    {/* Floating Utils - Hidden when AI Chat is open to avoid clutter */}
                    <div className={`absolute bottom-6 right-6 flex flex-col gap-3 z-[150] transition-all duration-500 ${showAIChat ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100'}`}>
                        <button
                            onClick={handleResetChart}
                            className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all hover:scale-110 active:scale-90 ${theme === 'dark' ? 'bg-[#1e2030]/80 border-slate-700 text-slate-400 hover:text-amber-500' : 'bg-white/80 border-slate-200 text-slate-600 hover:text-amber-600'}`}
                            title="Reset Layout"
                        >
                            <RotateCcw size={22} />
                        </button>
                        <button
                            className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all hover:scale-110 active:scale-90 ${theme === 'dark' ? 'bg-[#1e2030]/80 border-slate-700 text-slate-400 hover:text-purple-400' : 'bg-white/80 border-slate-200 text-slate-600 hover:text-purple-600'}`}
                            title="Snapshot"
                        >
                            <Camera size={22} />
                        </button>
                    </div>

                    {/* Mobile Sidebar Overlay */}
                    {!isSidebarCollapsed && isMobile && (
                        <div
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-300"
                            onClick={() => setIsSidebarCollapsed(true)}
                        />
                    )}
                </main>

                {/* Right Sidebar: AI Assistant */}
                <aside
                    className={`h-full border-l transition-all duration-700 ease-in-out flex flex-col flex-shrink-0 z-[100] ${focusMode
                        ? 'w-0 border-none overflow-hidden'
                        : showAIChat
                            ? isMobile ? 'fixed inset-0 w-full' : 'relative min-w-[420px] max-w-[420px]'
                            : 'w-0 border-none overflow-hidden'
                        } ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50' : 'bg-white border-slate-200'}`}
                >
                    {showAIChat && !focusMode && (
                        <div className="flex flex-col h-full w-full">
                            <header className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 ${theme === 'dark' ? 'bg-[#1e2030]/90 border-slate-700/50 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-purple-600/10 flex items-center justify-center">
                                        <Brain size={24} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className={`font-black tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Nunno AI</h3>
                                        <div className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-emerald-500">READY TO ASSIST</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAIChat(false)}
                                    className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}
                                >
                                    <X size={20} />
                                </button>
                            </header>

                            <div className="flex-1 overflow-hidden">
                                <PatternChatPanel
                                    onPatternGenerated={handleAIPattern}
                                    currentPrice={currentPrice}
                                    interval={interval}
                                    getTechnicalContext={() => {
                                        const lastCandle = chartData[chartData.length - 1];
                                        if (!lastCandle) return null;

                                        const activeIndicators = Object.keys(selectedIndicators)
                                            .filter(key => selectedIndicators[key]);

                                        const indicatorValues = {};
                                        ['ema9', 'ema21', 'ema50', 'ema100', 'ema200', 'rsi', 'atr'].forEach(key => {
                                            if (selectedIndicators[key] && calculatedIndicators[key]) {
                                                indicatorValues[key] = getCurrentValue(calculatedIndicators[key]);
                                            }
                                        });

                                        if (selectedIndicators.bollingerBands && calculatedIndicators.bbUpper) {
                                            indicatorValues.bollingerBands = {
                                                upper: getCurrentValue(calculatedIndicators.bbUpper),
                                                middle: getCurrentValue(calculatedIndicators.bbMiddle),
                                                lower: getCurrentValue(calculatedIndicators.bbLower)
                                            };
                                        }

                                        if (selectedIndicators.supportResistance && calculatedIndicators.support) {
                                            indicatorValues.levels = {
                                                support: calculatedIndicators.support.map(l => l.price),
                                                resistance: calculatedIndicators.resistance.map(l => l.price)
                                            };
                                        }

                                        if (selectedIndicators.macd && calculatedIndicators.macd) {
                                            indicatorValues.macd = {
                                                macd: getCurrentValue(calculatedIndicators.macd),
                                                signal: getCurrentValue(calculatedIndicators.macdSignal),
                                                histogram: getCurrentValue(calculatedIndicators.macdHistogram)
                                            };
                                        }

                                        return {
                                            symbol,
                                            interval,
                                            currentPrice: lastCandle.close,
                                            open: lastCandle.open,
                                            high: lastCandle.high,
                                            low: lastCandle.low,
                                            volume: lastCandle.volume || 0,
                                            recentHistory: chartData.slice(-5).map(d => ({
                                                t: d.time,
                                                o: d.open,
                                                h: d.high,
                                                l: d.low,
                                                c: d.close,
                                                v: d.volume || 0
                                            })),
                                            indicatorValues,
                                            activeIndicators,
                                            timestamp: new Date().toISOString()
                                        };
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default EliteChart;
