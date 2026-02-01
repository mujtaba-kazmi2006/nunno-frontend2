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
    FastForward
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
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showIndicatorsDropdown, setShowIndicatorsDropdown] = useState(false);
    const [showAIChat, setShowAIChat] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Watch for window resize to handle responsiveness
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarCollapsed(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
            wsRef.current.send(JSON.stringify({
                type: 'unsubscribe_kline',
                symbol: symbol.toLowerCase(),
                interval: interval
            }));
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
        <div className={`h-full w-full flex flex-col overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#16161e] text-slate-100' : 'bg-white text-slate-900'}`}>
            {/* Top Toolbar */}
            <div className={`border-b z-50 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#1e2030]/80 border-slate-700/50 backdrop-blur-xl' : 'bg-white/80 border-slate-200/50 shadow-sm'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between pl-16 pr-4 md:px-6 py-2 md:py-3 gap-3">
                    {/* Left: Symbol & Price */}
                    <div className="flex flex-wrap items-center gap-3 md:gap-6">
                        <div className="flex items-center gap-3">
                            <select
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                className={`px-3 py-1.5 md:px-4 md:py-2 border rounded-xl font-semibold text-sm md:text-base focus:outline-none transition-all disabled:opacity-50 ${theme === 'dark' ? 'bg-[#16161e] border-slate-700 text-slate-100 hover:border-purple-500' : 'bg-white/90 border-slate-200 text-slate-800 hover:border-purple-300'}`}
                            >
                                {tokenOptions.map(token => (
                                    <option key={token.symbol} value={token.symbol}>{token.name}</option>
                                ))}
                            </select>
                            <div className="flex flex-col">
                                <div className={`text-xl md:text-2xl font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className={`text-xs md:text-sm font-semibold ${priceChange >= 0 ? (theme === 'dark' ? 'text-emerald-400' : 'text-green-600') : (theme === 'dark' ? 'text-rose-400' : 'text-red-600')}`}>
                                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                                </div>
                            </div>
                        </div>

                        {/* Timeframe selector */}
                        <div className={`flex gap-1 rounded-lg p-1 overflow-x-auto no-scrollbar ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-slate-100'}`}>
                            {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                                <button
                                    key={tf}
                                    onClick={() => setInterval(tf)}
                                    className={`px-2.5 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${interval === tf
                                        ? (theme === 'dark' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-purple-600 shadow-sm')
                                        : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900')
                                        }`}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Controls */}
                    <div className="flex items-center justify-between md:justify-end gap-1.5 md:gap-2">
                        <div className={`flex gap-1 rounded-lg p-1 ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-slate-100'}`}>
                            {[
                                { type: 'candlestick', icon: BarChart3, label: 'Candles' },
                                { type: 'line', icon: Activity, label: 'Line' },
                                { type: 'area', icon: Layers, label: 'Area' }
                            ].map(({ type, icon: Icon, label }) => (
                                <button
                                    key={type}
                                    onClick={() => setChartType(type)}
                                    className={`p-1.5 md:px-3 md:py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${chartType === type
                                        ? (theme === 'dark' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-purple-600 shadow-sm')
                                        : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 shadow-sm')
                                        }`}
                                >
                                    <Icon size={isMobile ? 14 : 16} />
                                    <span className="hidden lg:inline">{label}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setFocusMode(!focusMode)}
                            className={`p-1.5 md:p-2 rounded-xl transition-all ${focusMode
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                : theme === 'dark' ? 'bg-[#1e2030] text-slate-300 hover:bg-slate-700/50' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            title="Focus Mode"
                        >
                            {focusMode ? <Minimize2 size={isMobile ? 14 : 18} /> : <Maximize2 size={isMobile ? 14 : 18} />}
                        </button>

                        <button
                            onClick={() => setShowAIChat(!showAIChat)}
                            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all ${showAIChat
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                : theme === 'dark' ? 'bg-[#1e2030] text-slate-300 hover:bg-slate-700/50' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            <MessageSquare size={isMobile ? 14 : 18} />
                            <span className="hidden md:inline">AI</span>
                        </button>

                        <button
                            onClick={toggleStreaming}
                            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all ${isStreaming
                                ? 'bg-red-500 text-white'
                                : 'bg-green-500 text-white'
                                }`}
                        >
                            {isStreaming ? (
                                <><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /><span className="hidden sm:inline">Live</span></>
                            ) : (
                                <><PlayCircle size={isMobile ? 14 : 18} /><span className="hidden sm:inline">Start</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-row overflow-hidden relative">
                {/* Sidebar */}
                <div
                    className={`absolute md:relative z-40 h-full border-r transition-all duration-300 ${focusMode
                        ? '-translate-x-full md:-translate-x-full md:w-0 border-none'
                        : isSidebarCollapsed
                            ? '-translate-x-full md:translate-x-0 md:w-16'
                            : 'translate-x-0 w-72 md:w-80'
                        } flex flex-col shadow-2xl md:shadow-none ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50' : 'bg-white/95 md:bg-white/80 backdrop-blur-xl border-slate-200/50'}`}
                >
                    {/* Sidebar Toggle (Mobile Floating) */}
                    {!focusMode && (
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className={`absolute -right-10 top-20 md:static p-2.5 border rounded-r-lg shadow-md md:shadow-none md:border-none md:rounded-none transition-colors flex items-center justify-center ${theme === 'dark' ? 'bg-[#16161e] border-slate-700 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                        >
                            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </button>
                    )}

                    {!isSidebarCollapsed && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Indicators Dropdown */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => setShowIndicatorsDropdown(!showIndicatorsDropdown)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all shadow-sm ${theme === 'dark' ? 'bg-[#16161e] hover:bg-slate-800' : 'bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100'}`}
                                >
                                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>INDICATORS</span>
                                    <ChevronDown
                                        size={18}
                                        className={`transition-transform duration-300 ${showIndicatorsDropdown ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {showIndicatorsDropdown && (
                                    <div className="space-y-3 pl-1">
                                        {/* Trend Indicators */}
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] font-bold text-purple-600 uppercase tracking-wider px-2 flex items-center gap-1">
                                                <TrendingUp size={12} />
                                                Trend
                                            </h4>
                                            {[
                                                { key: 'ema9', label: 'EMA 9', color: 'bg-amber-500', tooltip: 'Fast-moving average for short-term trends' },
                                                { key: 'ema21', label: 'EMA 21', color: 'bg-blue-500', tooltip: 'Medium-term trend indicator' },
                                                { key: 'ema50', label: 'EMA 50', color: 'bg-purple-500', tooltip: 'Intermediate trend strength' },
                                                { key: 'ema100', label: 'EMA 100', color: 'bg-pink-500', tooltip: 'Long-term trend direction' },
                                                { key: 'ema200', label: 'EMA 200', color: 'bg-red-500', tooltip: 'Major trend line & key support/resistance' }
                                            ].map(({ key, label, color, tooltip }) => (
                                                <button
                                                    key={key}
                                                    onClick={() => setSelectedIndicators(prev => ({ ...prev, [key]: !prev[key] }))}
                                                    className={`group relative w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${selectedIndicators[key]
                                                        ? (theme === 'dark' ? 'bg-purple-500/20 border-2 border-purple-500/50 shadow-sm' : 'bg-purple-50 border-2 border-purple-300 shadow-sm')
                                                        : (theme === 'dark' ? 'bg-[#16161e]/50 border-2 border-transparent hover:border-slate-700 hover:shadow-sm' : 'bg-slate-50 border-2 border-transparent hover:border-slate-200 hover:shadow-sm')
                                                        }`}
                                                    title={tooltip}
                                                >
                                                    <div className={`w-3 h-3 rounded-full ${color} shadow-sm`} />
                                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>
                                                    {selectedIndicators[key] ? (
                                                        <Eye size={14} className="ml-auto text-purple-600" />
                                                    ) : (
                                                        <EyeOff size={14} className="ml-auto text-slate-400" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Momentum Indicators */}
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider px-2 flex items-center gap-1">
                                                <Activity size={12} />
                                                Momentum
                                            </h4>
                                            {[
                                                { key: 'rsi', label: 'RSI (14)', color: 'bg-indigo-500', tooltip: 'Overbought/oversold indicator (0-100)' },
                                                { key: 'macd', label: 'MACD', color: 'bg-cyan-500', tooltip: 'Trend momentum & reversal signals' }
                                            ].map(({ key, label, color, tooltip }) => (
                                                <button
                                                    key={key}
                                                    onClick={() => setSelectedIndicators(prev => ({ ...prev, [key]: !prev[key] }))}
                                                    className={`group relative w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${selectedIndicators[key]
                                                        ? (theme === 'dark' ? 'bg-purple-500/20 border-2 border-purple-500/50 shadow-sm' : 'bg-purple-50 border-2 border-purple-300 shadow-sm')
                                                        : (theme === 'dark' ? 'bg-[#16161e]/50 border-2 border-transparent hover:border-slate-700 hover:shadow-sm' : 'bg-slate-50 border-2 border-transparent hover:border-slate-200 hover:shadow-sm')
                                                        }`}
                                                    title={tooltip}
                                                >
                                                    <div className={`w-3 h-3 rounded-full ${color === 'bg-indigo-500' ? 'bg-purple-500' : color} shadow-sm`} />
                                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>
                                                    {selectedIndicators[key] ? (
                                                        <Eye size={14} className="ml-auto text-purple-600" />
                                                    ) : (
                                                        <EyeOff size={14} className="ml-auto text-slate-400" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Volatility & Levels */}
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider px-2 flex items-center gap-1">
                                                <BarChart3 size={12} />
                                                Volatility & Levels
                                            </h4>
                                            {[
                                                { key: 'bollingerBands', label: 'Bollinger Bands', color: 'bg-violet-500', tooltip: 'Price volatility & deviation bands' },
                                                { key: 'atr', label: 'ATR (14)', color: 'bg-teal-500', tooltip: 'Average True Range - volatility measure' },
                                                { key: 'supportResistance', label: 'Support/Resistance', color: 'bg-emerald-500', tooltip: 'Key price levels for reversals' }
                                            ].map(({ key, label, color, tooltip }) => (
                                                <button
                                                    key={key}
                                                    onClick={() => setSelectedIndicators(prev => ({ ...prev, [key]: !prev[key] }))}
                                                    className={`group relative w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${selectedIndicators[key]
                                                        ? (theme === 'dark' ? 'bg-purple-500/20 border-2 border-purple-500/50 shadow-sm' : 'bg-purple-50 border-2 border-purple-300 shadow-sm')
                                                        : (theme === 'dark' ? 'bg-[#16161e]/50 border-2 border-transparent hover:border-slate-700 hover:shadow-sm' : 'bg-slate-50 border-2 border-transparent hover:border-slate-200 hover:shadow-sm')
                                                        }`}
                                                    title={tooltip}
                                                >
                                                    <div className={`w-3 h-3 rounded-full ${color} shadow-sm`} />
                                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>
                                                    {selectedIndicators[key] ? (
                                                        <Eye size={14} className="ml-auto text-purple-600" />
                                                    ) : (
                                                        <EyeOff size={14} className="ml-auto text-slate-400" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Scenario Simulator */}
                            <div className="space-y-2">
                                <h3 className={`text-sm font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>Scenario Simulator</h3>
                                <div className="space-y-1">
                                    {[
                                        { type: 'long', label: 'Long Support', icon: TrendingUp, color: 'bg-green-500' },
                                        { type: 'short', label: 'Short Resistance', icon: TrendingDown, color: 'bg-red-500' },
                                        { type: 'breakout', label: 'Breakout', icon: TrendingUp, color: 'bg-blue-500' },
                                        { type: 'breakdown', label: 'Breakdown', icon: TrendingDown, color: 'bg-orange-500' },
                                        { type: 'mean-reversion', label: 'Mean Reversion', icon: Activity, color: 'bg-purple-500' }
                                    ].map(({ type, label, icon: Icon, color }) => (
                                        <button
                                            key={type}
                                            onClick={() => generateScenario(type)}
                                            className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${simulationMode === type
                                                ? (theme === 'dark' ? 'bg-purple-500/20 border-2 border-purple-500/50' : 'bg-purple-50 border-2 border-purple-300')
                                                : (theme === 'dark' ? 'bg-[#16161e]/50 border-2 border-transparent hover:border-slate-700' : 'bg-slate-50 border-2 border-transparent hover:border-slate-200')
                                                }`}
                                        >
                                            <div className={`p-1 rounded ${color}`}>
                                                <Icon size={14} className="text-white" />
                                            </div>
                                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Scenario Info */}
                            {simulationActive && scenarioData && (
                                <div className={`rounded-xl p-4 border transition-colors ${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-900'}`}>{scenarioData.type}</h4>
                                        <button
                                            onClick={() => {
                                                setSimulationActive(false);
                                                setScenarioData(null);
                                                setSimulationMode(null);
                                                setActiveAiPattern(null);
                                                // Clear price lines
                                                priceLineRefs.current.forEach(line => {
                                                    if (line && mainSeriesRef.current) {
                                                        try { mainSeriesRef.current.removePriceLine(line); } catch (e) { }
                                                    }
                                                });
                                                priceLineRefs.current = [];
                                                // Clear projection
                                                if (projectionSeries && chartRef.current) {
                                                    try { chartRef.current.removeSeries(projectionSeries); } catch (e) { }
                                                    setProjectionSeries(null);
                                                }
                                            }}
                                            className={`transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Entry:</span>
                                            <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>${scenarioData.entryPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Target:</span>
                                            <span className="font-bold text-green-600">${scenarioData.targetPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Stop Loss:</span>
                                            <span className="font-bold text-red-600">${scenarioData.stopLoss.toFixed(2)}</span>
                                        </div>
                                        <div className={`flex justify-between pt-2 border-t ${theme === 'dark' ? 'border-purple-500/20' : 'border-purple-200'}`}>
                                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>R:R Ratio:</span>
                                            <span className="font-bold text-purple-600">{scenarioData.riskReward}:1</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Potential Gain:</span>
                                            <span className="font-bold text-green-600">+{scenarioData.potentialGain}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Potential Loss:</span>
                                            <span className="font-bold text-red-600">-{scenarioData.potentialLoss}%</span>
                                        </div>
                                    </div>
                                    <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-purple-500/20' : 'border-purple-200'}`}>
                                        <p className={`text-xs italic ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{scenarioData.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Chart Area */}
                <div className={`flex-1 relative min-h-0 ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-slate-50'}`}>
                    {/* OHLC HUD - Compact on Mobile */}
                    <div className={`absolute top-2 md:top-4 left-16 md:left-4 z-10 backdrop-blur-xl rounded-lg md:rounded-xl shadow-lg border p-2 md:p-4 max-w-[calc(100%-1rem)] overflow-x-auto no-scrollbar transition-colors duration-500 ${theme === 'dark' ? 'bg-[#1e2030]/90 border-slate-700/50' : 'bg-white/90 border-slate-200/50'}`}>
                        <div className="flex gap-3 md:gap-6 text-[10px] md:text-sm whitespace-nowrap">
                            <div>
                                <div className={`text-[8px] md:text-xs mb-0.5 md:mb-1 uppercase tracking-tight ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Open</div>
                                <div className={`font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                    ${chartData[chartData.length - 1]?.open.toFixed(2) || '—'}
                                </div>
                            </div>
                            <div>
                                <div className={`text-[8px] md:text-xs mb-0.5 md:mb-1 uppercase tracking-tight ${theme === 'dark' ? 'text-emerald-500/80' : 'text-slate-500'}`}>High</div>
                                <div className={`font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-green-600'}`}>
                                    ${chartData[chartData.length - 1]?.high.toFixed(2) || '—'}
                                </div>
                            </div>
                            <div>
                                <div className={`text-[8px] md:text-xs mb-0.5 md:mb-1 uppercase tracking-tight ${theme === 'dark' ? 'text-rose-500/80' : 'text-slate-500'}`}>Low</div>
                                <div className={`font-bold ${theme === 'dark' ? 'text-rose-400' : 'text-red-600'}`}>
                                    ${chartData[chartData.length - 1]?.low.toFixed(2) || '—'}
                                </div>
                            </div>
                            <div>
                                <div className={`text-[8px] md:text-xs mb-0.5 md:mb-1 uppercase tracking-tight ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Close</div>
                                <div className={`font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                    ${chartData[chartData.length - 1]?.close.toFixed(2) || '—'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart container */}
                    <div ref={chartContainerRef} className="w-full h-full" />

                    {/* Reset Chart button */}
                    <button
                        onClick={handleResetChart}
                        className={`absolute bottom-4 right-16 p-3 backdrop-blur-xl rounded-xl shadow-lg border transition-all group z-10 ${theme === 'dark' ? 'bg-[#1e2030]/90 border-slate-700 hover:bg-orange-500/10 hover:border-orange-500' : 'bg-white/90 border-slate-200/50 hover:bg-orange-50 hover:border-orange-300'}`}
                        title="Reset Chart (Clear all indicators & patterns)"
                    >
                        <RotateCcw size={20} className={`transition-colors ${theme === 'dark' ? 'text-slate-400 group-hover:text-orange-500' : 'text-slate-600 group-hover:text-orange-600'}`} />
                    </button>

                    {/* Snapshot button */}
                    <button
                        className={`absolute bottom-4 right-4 p-3 backdrop-blur-xl rounded-xl shadow-lg border transition-all group z-10 ${theme === 'dark' ? 'bg-[#1e2030]/90 border-slate-700 hover:bg-purple-500/10 hover:border-purple-500' : 'bg-white/90 border-slate-200/50 hover:bg-purple-50 hover:border-purple-300'}`}
                        title="Take snapshot (Alt+S)"
                    >
                        <Camera size={20} className={`transition-colors ${theme === 'dark' ? 'text-slate-400 group-hover:text-purple-400' : 'text-slate-600 group-hover:text-purple-600'}`} />
                    </button>

                    {/* Mobile Sidebar Overlay */}
                    {!isSidebarCollapsed && isMobile && (
                        <div
                            className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] z-30 opacity-100 transition-opacity"
                            onClick={() => setIsSidebarCollapsed(true)}
                        />
                    )}
                </div>

                {/* AI Chat Panel - Dynamic Transition */}
                <div
                    className={`h-full border-l transition-all duration-500 ease-in-out flex flex-col flex-shrink-0 z-50 ${focusMode
                        ? 'w-0 border-none overflow-hidden'
                        : showAIChat
                            ? isMobile ? 'absolute inset-0 w-full' : 'relative min-w-[450px] max-w-[450px]'
                            : 'w-0 border-none overflow-hidden'
                        } ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50' : 'bg-white border-slate-200/50'}`}
                >
                    {showAIChat && !focusMode && (
                        <div className="flex flex-col h-full w-full">
                            <div className={`flex items-center justify-between p-4 border-b backdrop-blur-md sticky top-0 z-10 ${theme === 'dark' ? 'bg-[#1e2030]/80 border-slate-700/50' : 'bg-white/80 border-slate-200'}`}>
                                <h3 className={`font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                    <span className="tracking-tight">Nunno AI Assistant</span>
                                </h3>
                                <button
                                    onClick={() => setShowAIChat(false)}
                                    className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-500'}`}
                                >
                                    <X size={20} />
                                </button>
                            </div>
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

                                        // Standard indicators
                                        ['ema9', 'ema21', 'ema50', 'ema100', 'ema200', 'rsi', 'atr'].forEach(key => {
                                            if (selectedIndicators[key] && calculatedIndicators[key]) {
                                                indicatorValues[key] = getCurrentValue(calculatedIndicators[key]);
                                            }
                                        });

                                        // Multi-value indicators
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
                                            high: lastCandle.high,
                                            low: lastCandle.low,
                                            open: lastCandle.open,
                                            volume: lastCandle.volume,
                                            recentHistory: chartData.slice(-5).map(d => ({
                                                t: d.time,
                                                o: d.open,
                                                h: d.high,
                                                l: d.low,
                                                c: d.close,
                                                v: d.volume
                                            })),
                                            indicatorValues,
                                            activeIndicators,
                                            dataPointsCount: chartData.length,
                                            timestamp: new Date().toISOString()
                                        };
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EliteChart;
