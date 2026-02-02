import React, { useEffect, useRef, useState } from 'react';
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
    Brain
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

    // Data state
    const [chartData, setChartData] = useState([]);
    const [symbol, setSymbol] = useState('BTCUSDT');
    const [interval, setInterval] = useState('1m');
    const [isStreaming, setIsStreaming] = useState(true);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [priceChange, setPriceChange] = useState(0);

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
    const [scenarioData, setScenarioData] = useState(null);
    const [projectionSeries, setProjectionSeries] = useState(null);
    const [activeAiPattern, setActiveAiPattern] = useState(null);

    // UI Enhancement state
    const [focusMode, setFocusMode] = useState(false);
    const [indicatorCategory, setIndicatorCategory] = useState('all'); // 'all', 'trend', 'momentum', 'volatility'
    const [isTickerMenuOpen, setIsTickerMenuOpen] = useState(false);
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
        { symbol: 'LINKUSDT', name: 'Chainlink' }
    ];

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

        let scenario = null;
        let projectionPoints = [];

        // Helper to generate a realistic projected path from current price
        const generatePath = (entryPrice, targetPrice, steps = 25, startTime = null) => {
            const path = [];
            const totalDiff = targetPrice - entryPrice;
            const baseTime = startTime || lastCandle.time;
            const timeIncrement = interval === '1d' ? 86400 : interval === '1h' ? 3600 : 60;

            for (let i = 0; i <= steps; i++) {
                const progress = i / steps;
                // Use a more realistic curve (not linear)
                const easeProgress = 1 - Math.pow(1 - progress, 2); // Ease-out quad

                // Add realistic volatility
                const volatilityFactor = Math.sin(progress * Math.PI * 3) * 0.3; // Wave pattern
                const noise = volatilityFactor * avgVolatility;

                const baseValue = entryPrice + (totalDiff * easeProgress);
                const value = baseValue + noise;

                path.push({
                    time: baseTime + (i * timeIncrement),
                    value: value
                });
            }
            return path;
        };

        switch (type) {
            case 'long':
                // Entry at nearest support below current price
                const supportLevel = calculatedIndicators.support?.[0]?.price || lastPrice * 0.985;
                const longTarget = supportLevel * 1.025; // 2.5% gain
                const longStop = supportLevel * 0.988; // 1.2% stop

                // Path: current -> support (entry) -> target
                const toSupport = generatePath(lastPrice, supportLevel, 8);
                const toTarget = generatePath(supportLevel, longTarget, 17, toSupport[toSupport.length - 1].time);
                projectionPoints = [...toSupport, ...toTarget.slice(1)];

                scenario = {
                    type: 'Long Support',
                    entryPrice: supportLevel,
                    targetPrice: longTarget,
                    stopLoss: longStop,
                    description: 'Buy at support bounce with 2:1 risk-reward ratio.'
                };
                break;

            case 'short':
                // Entry at nearest resistance above current price
                const resistanceLevel = calculatedIndicators.resistance?.[0]?.price || lastPrice * 1.015;
                const shortTarget = resistanceLevel * 0.975; // 2.5% gain
                const shortStop = resistanceLevel * 1.012; // 1.2% stop

                // Path: current -> resistance (entry) -> target
                const toResistance = generatePath(lastPrice, resistanceLevel, 8);
                const toShortTarget = generatePath(resistanceLevel, shortTarget, 17, toResistance[toResistance.length - 1].time);
                projectionPoints = [...toResistance, ...toShortTarget.slice(1)];

                scenario = {
                    type: 'Short Resistance',
                    entryPrice: resistanceLevel,
                    targetPrice: shortTarget,
                    stopLoss: shortStop,
                    description: 'Sell at resistance rejection with 2:1 risk-reward.'
                };
                break;

            case 'breakout':
                const breakoutResistance = calculatedIndicators.resistance?.[0]?.price || lastPrice * 1.01;
                const breakoutTarget = breakoutResistance * 1.035; // Strong move after breakout
                const breakoutStop = breakoutResistance * 0.995;

                // Path: current -> resistance -> breakout -> target
                const toBreakoutPoint = generatePath(lastPrice, breakoutResistance, 10);
                const breakoutMove = generatePath(breakoutResistance, breakoutTarget, 15, toBreakoutPoint[toBreakoutPoint.length - 1].time);
                projectionPoints = [...toBreakoutPoint, ...breakoutMove.slice(1)];

                scenario = {
                    type: 'Breakout',
                    entryPrice: breakoutResistance,
                    targetPrice: breakoutTarget,
                    stopLoss: breakoutStop,
                    description: 'Momentum breakout above resistance with volume confirmation.'
                };
                break;

            case 'breakdown':
                const breakdownSupport = calculatedIndicators.support?.[0]?.price || lastPrice * 0.99;
                const breakdownTarget = breakdownSupport * 0.965;
                const breakdownStop = breakdownSupport * 1.005;

                // Path: current -> support -> breakdown -> target
                const toBreakdownPoint = generatePath(lastPrice, breakdownSupport, 10);
                const breakdownMove = generatePath(breakdownSupport, breakdownTarget, 15, toBreakdownPoint[toBreakdownPoint.length - 1].time);
                projectionPoints = [...toBreakdownPoint, ...breakdownMove.slice(1)];

                scenario = {
                    type: 'Breakdown',
                    entryPrice: breakdownSupport,
                    targetPrice: breakdownTarget,
                    stopLoss: breakdownStop,
                    description: 'Momentum breakdown below support level.'
                };
                break;

            case 'mean-reversion':
                const middleBB = calculatedIndicators.bbMiddle ? getCurrentValue(calculatedIndicators.bbMiddle) : lastPrice;
                const isAboveMean = lastPrice > middleBB;
                const meanTarget = middleBB;
                const meanStop = isAboveMean ? lastPrice * 1.015 : lastPrice * 0.985;

                projectionPoints = generatePath(lastPrice, meanTarget, 20);

                scenario = {
                    type: 'Mean Reversion',
                    entryPrice: lastPrice,
                    targetPrice: meanTarget,
                    stopLoss: meanStop,
                    description: `Price ${isAboveMean ? 'above' : 'below'} average - expecting reversion to 20 EMA.`
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
                                        <div className={`absolute top-full left-0 mt-2 w-64 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300 z-[100] ${theme === 'dark' ? 'bg-[#1e2030]/95 border-slate-700/50' : 'bg-white/95 border-slate-200 shadow-slate-200/50'}`}>
                                            <div className="p-2 grid grid-cols-1 gap-1">
                                                {tokenOptions.map(token => (
                                                    <button
                                                        key={token.symbol}
                                                        onClick={() => {
                                                            setSymbol(token.symbol);
                                                            setIsTickerMenuOpen(false);
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
                                                ))}
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

                        {/* Quick Timeframe Switcher */}
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
                    {/* OHLC Overlay (Glassmorphism) - Responsive position and layout */}
                    <div className={`absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-auto z-20 backdrop-blur-md rounded-2xl md:rounded-3xl border overflow-hidden shadow-2xl transition-all duration-700 ${theme === 'dark' ? 'bg-[#1e2030]/60 border-white/5 shadow-black/40' : 'bg-white/60 border-white shadow-slate-200/50'}`}>
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

                    {/* Chart Container */}
                    <div ref={chartContainerRef} className="w-full h-full" />

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
