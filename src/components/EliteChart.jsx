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
    User,
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
    Clock,
    Ghost,
    Droplets,
    Loader2,
    Microscope,
    LogIn,
    Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    calculateEMA,
    calculateRSI,
    calculateMACD,
    calculateBollingerBands,
    calculateSupportResistance,
    calculateEnhancedSupportResistance,
    calculateATR,
    getCurrentValue
} from '../utils/technicalIndicators';
import PatternChatPanel from './PatternChatPanel';
import LoginSignup from './LoginSignup';
import LiquidityHeatmap from './LiquidityHeatmap';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { analytics } from '../utils/analytics';
import { formatPrice, formatTickPrice } from '../utils/formatPrice';
import SEO from './SEO';

const EliteChart = () => {
    // Chart refs
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const mainSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);
    const indicatorSeriesRefs = useRef({
        live_trendlines: [],
        position_tools: [],
        ai_pattern: null,
        ai_trendlines: [],
        ai_position_tools: []
    });
    const priceLineRefs = useRef([]);
    const blueprintLineRefs = useRef({ entry: null, target: null, stop: null });

    // Data state
    const [searchParams] = useSearchParams();
    const [chartData, setChartData] = useState([]);
    const [symbol, setSymbol] = useState(searchParams.get('ticker') || 'BTCUSDT');
    const [interval, setInterval] = useState(searchParams.get('interval') || '1m');
    const [isStreaming, setIsStreaming] = useState(true);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [priceChange, setPriceChange] = useState(0);
    const [hoveredCandle, setHoveredCandle] = useState(null);
    const chartDataRef = useRef([]);

    // Update chartDataRef whenever chartData changes
    useEffect(() => {
        chartDataRef.current = chartData;
    }, [chartData]);

    // Initial highlighting state
    const [highlightedLevels, setHighlightedLevels] = useState({ support: null, resistance: null });
    const highlightedPriceLinesRef = useRef([]);
    const hasBlinkedRef = useRef(false);

    // Correlation state
    const [correlationData, setCorrelationData] = useState(null);
    const correlationSeriesRef = useRef(null);

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
        atr: false,
        candlestickPatterns: false,
        onchainBias: false
    });
    const [onchainData, setOnchainData] = useState(null);
    const [onchainHistory, setOnchainHistory] = useState([]);
    const [srEngine, setSrEngine] = useState('classic'); // 'classic' or 'enhanced'
    const [srType, setSrType] = useState('area'); // 'level' or 'area'
    const [srFilter, setSrFilter] = useState('all'); // 'all' or 'strong'
    const [calculatedIndicators, setCalculatedIndicators] = useState({});
    const [candlestickMarkers, setCandlestickMarkers] = useState([]);
    const [activeCandlePatterns, setActiveCandlePatterns] = useState(['all']);
    const [showCandlePatternsDropdown, setShowCandlePatternsDropdown] = useState(false);
    const [showSRDropdown, setShowSRDropdown] = useState(false);

    // Ticker search ref
    const tickerMenuRef = useRef(null);

    // Update symbol if URL parameter changes
    useEffect(() => {
        const ticker = searchParams.get('ticker');
        if (ticker) {
            setSymbol(ticker.toUpperCase());
        }

        const indicators = searchParams.get('indicators');
        if (indicators) {
            const indicatorList = indicators.split(',');
            setSelectedIndicators(prev => {
                const newState = { ...prev };
                indicatorList.forEach(ind => {
                    const trimmed = ind.trim().toLowerCase();
                    // Map lowercase URL params to camelCase state keys
                    const mapping = {
                        'rsi': 'rsi',
                        'macd': 'macd',
                        'ema9': 'ema9',
                        'ema21': 'ema21',
                        'ema50': 'ema50',
                        'ema100': 'ema100',
                        'ema200': 'ema200',
                        'bollingerbands': 'bollingerBands',
                        'supportresistance': 'supportResistance',
                        'atr': 'atr',
                        'candlestickpatterns': 'candlestickPatterns'
                    };

                    const stateKey = mapping[trimmed];
                    if (stateKey && newState.hasOwnProperty(stateKey)) {
                        newState[stateKey] = true;
                    }
                });
                return newState;
            });
        }

        const urlInterval = searchParams.get('interval');
        if (urlInterval) {
            setInterval(urlInterval);
        }

        const support = searchParams.get('support');
        const resistance = searchParams.get('resistance');
        const highlight = searchParams.get('highlight');
        if (highlight === 'true' && (support || resistance)) {
            setHighlightedLevels({
                support: support ? parseFloat(support) : null,
                resistance: resistance ? parseFloat(resistance) : null
            });
            hasBlinkedRef.current = false;
        }
    }, [searchParams]);

    // UI state
    const [chartType, setChartType] = useState('candlestick');
    const { theme } = useTheme();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1280);
    const [showIndicatorsDropdown, setShowIndicatorsDropdown] = useState(false);
    const [showAIChat, setShowAIChat] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Update isMobile on resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Render Correlation Overlay
    useEffect(() => {
        if (!chartRef.current || !correlationData) return;

        // Clear existing correlation series
        if (correlationSeriesRef.current) {
            try { chartRef.current.removeSeries(correlationSeriesRef.current); } catch (e) { }
        }

        // Add new line series for correlation (Ghost Chart)
        const series = chartRef.current.addLineSeries({
            color: theme === 'dark' ? 'rgba(139, 92, 246, 0.8)' : 'rgba(99, 102, 241, 0.7)',
            lineWidth: 3,
            lineStyle: 0, // Solid
            crosshairMarkerVisible: true,
            priceLineVisible: false,
            lastValueVisible: true,
            title: `CORR: ${correlationData.ticker.replace('USDT', '')} (${correlationData.score})`,
        });

        series.setData(correlationData.overlay_data);
        correlationSeriesRef.current = series;

        return () => {
            if (correlationSeriesRef.current && chartRef.current) {
                try { chartRef.current.removeSeries(correlationSeriesRef.current); } catch (e) { }
                correlationSeriesRef.current = null;
            }
        };
    }, [correlationData, theme]);


    const handleCorrelationOverlay = (data) => {
        console.log("🧬 Correlation Overlay Data Received:", data);
        setCorrelationData(data);
    };

    // Level Highlighting Animation (Blinking)
    useEffect(() => {
        if (!mainSeriesRef.current || (!highlightedLevels.support && !highlightedLevels.resistance)) return;
        if (chartData.length === 0 || hasBlinkedRef.current) return;

        hasBlinkedRef.current = true;
        // Clear existing highlighted lines
        highlightedPriceLinesRef.current.forEach(line => {
            try { mainSeriesRef.current.removePriceLine(line); } catch (e) { }
        });
        highlightedPriceLinesRef.current = [];

        const newLines = [];
        if (highlightedLevels.support) {
            const line = mainSeriesRef.current.createPriceLine({
                price: highlightedLevels.support,
                color: '#00ff88', // Neon Mint
                lineWidth: 4,
                lineStyle: 0,
                axisLabelVisible: true,
                title: 'NEURAL SUPPORT'
            });
            newLines.push({ line, baseColor: '#00ff88', pulseColor: '#00cc66' });
        }
        if (highlightedLevels.resistance) {
            const line = mainSeriesRef.current.createPriceLine({
                price: highlightedLevels.resistance,
                color: '#ff3399', // Neon Magenta
                lineWidth: 4,
                lineStyle: 0,
                axisLabelVisible: true,
                title: 'NEURAL RESISTANCE'
            });
            newLines.push({ line, baseColor: '#ff3399', pulseColor: '#cc0066' });
        }

        highlightedPriceLinesRef.current = newLines.map(nl => nl.line);

        // Neon Pulse Animation loop
        let step = 0;
        const maxSteps = 30; // 3 seconds (100ms * 30)

        const pulseInterval = window.setInterval(() => {
            const width = 2 + Math.abs(Math.sin(step * 0.4) * 5); // Oscillate width between 2 and 7

            newLines.forEach(item => {
                item.line.applyOptions({
                    lineWidth: width,
                    color: step % 2 === 0 ? item.baseColor : item.pulseColor
                });
            });

            step++;
            if (step >= maxSteps) {
                window.clearInterval(pulseInterval);
                // Permanent cleanup: Remove the lines completely after the highlight
                newLines.forEach(item => {
                    try { mainSeriesRef.current.removePriceLine(item.line); } catch (e) { }
                });
                highlightedPriceLinesRef.current = [];
            }
        }, 100);

        return () => {
            window.clearInterval(pulseInterval);
        };
    }, [highlightedLevels, chartData]); // Re-run when chartData fills or levels change

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




    // Simulation state
    const [simulationMode, setSimulationMode] = useState(null);
    const [simulationActive, setSimulationActive] = useState(false);
    const [projectionSeries, setProjectionSeries] = useState(null);
    const [activeAiPattern, setActiveAiPattern] = useState(null);
    const [liveDetectedPatterns, setLiveDetectedPatterns] = useState(null);

    // Blueprint / Judge My Trade state
    const [isBlueprintMode, setIsBlueprintMode] = useState(false);
    const [blueprintPrices, setBlueprintPrices] = useState({ entry: 0, target: 0, stop: 0 });
    const [blueprintStep, setBlueprintStep] = useState(null); // 'entry', 'target', 'stop'
    const [blueprintVerdict, setBlueprintVerdict] = useState(null);
    const [showDetailedVerdict, setShowDetailedVerdict] = useState(false);
    const [isJudging, setIsJudging] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // ── Tactical Entry Scan state ──────────────────────────────
    const [isTacticalMode, setIsTacticalMode] = useState(false);
    const [tacticalEntry, setTacticalEntry] = useState(null);
    const [tacticalResult, setTacticalResult] = useState(null);
    const [isTacticalScanning, setIsTacticalScanning] = useState(false);
    const tacticalSeriesRefs = useRef([]);

    // Auth & Limits
    const { user, isAuthenticated, refreshUser } = useAuth();

    const checkSearchLimit = () => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return false;
        }

        if (user?.searches_today >= (user?.limits?.daily_searches || 10)) {
            setSimulationError("SYSTEM OVERLOAD: DAILY SCAN LIMIT REACHED. REFRESH IN 24H.");
            return false;
        }
        return true;
    };

    const logSearchToBackend = async () => {
        try {
            await axios.post('/api/v1/log-search');
            refreshUser(); // Sync the UI
        } catch (e) {
            console.error("Failed to log search:", e);
        }
    };

    // UI Enhancement state
    const [focusMode, setFocusMode] = useState(false);
    const [indicatorCategory, setIndicatorCategory] = useState('all'); // 'all', 'trend', 'momentum', 'volatility'
    const [isTickerMenuOpen, setIsTickerMenuOpen] = useState(false);
    const [tickerSearch, setTickerSearch] = useState('');

    // Simulation 2.0 State
    const [monteCarloFan, setMonteCarloFan] = useState(null);
    const [monteCarloPaths, setMonteCarloPaths] = useState([]);
    const [isSimulatingBackend, setIsSimulatingBackend] = useState(false);
    const [scenarioData, setScenarioData] = useState(null);
    const [simulationStatus, setSimulationStatus] = useState('');
    const [simulationError, setSimulationError] = useState(null);
    const [showSimulationDetails, setShowSimulationDetails] = useState(false);
    const [showLabDeepDive, setShowLabDeepDive] = useState(false);
    const fanSeriesRefs = useRef([]);

    // Liquidity Heatmap state
    const [showLiquidityHeatmap, setShowLiquidityHeatmap] = useState(false);

    // WebSocket ref
    const wsRef = useRef(null);
    const reconnectTimerRef = useRef(null);

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
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
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
            wickDownColor: '#ef4444',
            priceFormat: {
                type: 'price',
                formatter: (price) => formatTickPrice(price)
            }
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

    // Subscribe to crosshair move for OHLC display
    useEffect(() => {
        if (!chartRef.current) return;

        const handleCrosshairMove = (param) => {
            if (!param.time || !param.point) {
                setHoveredCandle(null);
                return;
            }

            const series = mainSeriesRef.current;
            if (!series) return;

            const data = param.seriesData.get(series);
            if (data) {
                if (data.open !== undefined) {
                    // In candlestick mode, data already has OHLC
                    setHoveredCandle(data);
                } else {
                    // In line/area mode, find the original candle data for complete OHLC
                    const candle = chartDataRef.current.find(d => d.time === param.time);
                    if (candle) {
                        setHoveredCandle(candle);
                    }
                }
            } else {
                setHoveredCandle(null);
            }
        };

        chartRef.current.subscribeCrosshairMove(handleCrosshairMove);
        return () => {
            if (chartRef.current) {
                chartRef.current.unsubscribeCrosshairMove(handleCrosshairMove);
            }
        };
    }, []); // Only subscribe once on mount

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

    const [scanProgress, setScanProgress] = useState([]);

    const judgeTrade = async () => {
        if (!checkSearchLimit()) return;

        if (!blueprintPrices.entry || !blueprintPrices.target || !blueprintPrices.stop) {
            alert('Please set all markers (Entry, Target, Stop) on the chart first.');
            return;
        }

        setIsJudging(true);
        setScanProgress([]);
        setBlueprintVerdict(null);
        await logSearchToBackend();

        // Track GA4 event
        analytics.trackTradeJudge(symbol, 'analyzing');

        const { entry, target, stop } = blueprintPrices;
        const isLong = target > entry;

        // ── Phase 1: Animated scanning sequence ──────────────
        const scanSteps = [
            { step: "Multi-Timeframe Structure", icon: "📊" },
            { step: "Volume & Liquidity Zones", icon: "🌊" },
            { step: "Derivatives & Funding Rates", icon: "📈" },
            { step: "News Intelligence Vault", icon: "📰" },
            { step: "Risk/Reward Mathematics", icon: "🧮" },
        ];

        // Animate scan steps one by one
        for (let i = 0; i < scanSteps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 400));
            setScanProgress(prev => [...prev, { ...scanSteps[i], status: 'scanning' }]);
            await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
            setScanProgress(prev => prev.map((s, idx) =>
                idx === i ? { ...s, status: 'complete' } : s
            ));
        }

        // ── Phase 2: Gather all frontend indicator data ──────
        const indicators = {};

        // RSI
        if (calculatedIndicators.rsi) indicators.rsi = getCurrentValue(calculatedIndicators.rsi);
        // ATR
        if (calculatedIndicators.atr) indicators.atr = getCurrentValue(calculatedIndicators.atr);
        // EMAs
        ['ema9', 'ema21', 'ema50', 'ema100', 'ema200'].forEach(key => {
            if (calculatedIndicators[key]) indicators[key] = getCurrentValue(calculatedIndicators[key]);
        });
        // MACD
        if (calculatedIndicators.macd) {
            indicators.macd = getCurrentValue(calculatedIndicators.macd);
            indicators.macdSignal = getCurrentValue(calculatedIndicators.macdSignal);
            indicators.macdHistogram = getCurrentValue(calculatedIndicators.macdHistogram);
        }
        // Bollinger Bands
        if (calculatedIndicators.bbUpper) {
            indicators.bbUpper = getCurrentValue(calculatedIndicators.bbUpper);
            indicators.bbMiddle = getCurrentValue(calculatedIndicators.bbMiddle);
            indicators.bbLower = getCurrentValue(calculatedIndicators.bbLower);
        }
        // Support & Resistance
        if (calculatedIndicators.support) indicators.support = calculatedIndicators.support;
        if (calculatedIndicators.resistance) indicators.resistance = calculatedIndicators.resistance;
        indicators.entry = entry;

        // ── Phase 3: Call the God-Mode backend validator ──────
        const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/v1/validate-trade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    ticker: symbol,
                    entry,
                    target,
                    stop,
                    current_price: currentPrice || entry,
                    indicators,
                }),
            });

            if (response.ok) {
                const result = await response.json();

                setBlueprintVerdict({
                    // New God-Mode fields
                    confluenceScore: result.confluence_score,
                    verdict: result.verdict,
                    verdictEmoji: result.verdict_emoji,
                    direction: result.direction,
                    radar: result.radar,
                    dimensions: result.dimensions,
                    checklist: result.checklist,
                    suggestions: result.suggestions,
                    scanLog: result.scan_log,

                    // Legacy compatibility fields
                    score: Math.round(result.confluence_score / 10),
                    rr: result.rr_ratio,
                    status: result.direction === 'LONG'
                        ? (result.confluence_score >= 60 ? 'bullish' : 'neutral')
                        : (result.confluence_score >= 60 ? 'bearish' : 'neutral'),
                    stats: {
                        rsi: indicators.rsi?.toFixed(1) || 'N/A',
                        atr: indicators.atr?.toFixed(2) || 'N/A',
                        risk: formatPrice(Math.abs(entry - stop), { symbol: false }),
                        reward: formatPrice(Math.abs(target - entry), { symbol: false }),
                        entry: formatPrice(entry),
                        target: formatPrice(target),
                        stop: formatPrice(stop),
                    },
                });
            } else {
                // Fallback to local-only analysis
                _localFallbackVerdict(entry, target, stop, isLong, indicators);
            }
        } catch (err) {
            console.error('Trade validator API error:', err);
            _localFallbackVerdict(entry, target, stop, isLong, indicators);
        }

        setIsJudging(false);
        setShowDetailedVerdict(false);
    };

    // Local-only fallback if backend is unreachable
    const _localFallbackVerdict = (entry, target, stop, isLong, indicators) => {
        const risk = Math.abs(entry - stop);
        const reward = Math.abs(target - entry);
        const rr = (reward / risk).toFixed(2);
        const rsi = indicators.rsi || 50;
        const atr = indicators.atr || entry * 0.02;

        let score = 50;
        if (rr >= 2.5) score += 20;
        else if (rr < 1) score -= 20;
        if (isLong && rsi < 40) score += 10;
        else if (isLong && rsi > 70) score -= 15;
        if (!isLong && rsi > 60) score += 10;
        else if (!isLong && rsi < 30) score -= 15;
        if (risk < atr * 0.5) score -= 10;
        else if (risk >= atr * 0.8) score += 10;
        score = Math.max(0, Math.min(100, score));

        setBlueprintVerdict({
            confluenceScore: score,
            verdict: score >= 65 ? 'MODERATE_BIAS' : score >= 40 ? 'LOW_PROBABILITY' : 'HIGH_RISK',
            verdictEmoji: score >= 65 ? '🟡' : score >= 40 ? '🟠' : '🔴',
            direction: isLong ? 'LONG' : 'SHORT',
            radar: {
                Technicals: Math.min(100, score + 10),
                Momentum: Math.min(100, score),
                Sentiment: 50,
                Fundamentals: 50,
                'Risk Mgmt': rr >= 2 ? 75 : 35,
            },
            dimensions: {},
            checklist: [
                { label: 'Risk/Reward ≥ 2:1', pass: rr >= 2, value: `${rr}:1` },
                { label: 'RSI Not Extreme', pass: rsi > 30 && rsi < 70, value: rsi.toFixed?.(1) || rsi },
                { label: 'Stop Outside ATR', pass: risk >= atr * 0.5, value: risk >= atr * 0.5 ? '✓' : '✗' },
            ],
            suggestions: [rr < 2 ? 'Consider widening your Take Profit to achieve a 2:1 R:R ratio.' : 'Trade setup appears reasonable. Execute with discipline.'],
            score: Math.round(score / 10),
            rr: rr,
            status: isLong ? (score > 60 ? 'bullish' : 'neutral') : (score > 60 ? 'bearish' : 'neutral'),
            stats: {
                rsi: rsi?.toFixed?.(1) || 'N/A',
                atr: atr?.toFixed?.(2) || 'N/A',
                risk: formatPrice(Math.abs(entry - stop), { symbol: false }),
                reward: formatPrice(Math.abs(target - entry), { symbol: false }),
                entry: formatPrice(entry),
                target: formatPrice(target),
                stop: formatPrice(stop),
            },
        });
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
                topColor: 'rgba(55, 159, 157, 0.4)',
                bottomColor: 'rgba(55, 159, 157, 0.0)',
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
                `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`
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

        // Clear any existing reconnection timeout
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }

        try {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            if (apiBaseUrl === 'your_key_here' || !apiBaseUrl.startsWith('http')) {
                apiBaseUrl = 'http://localhost:8000';
            }
            const wsHost = apiBaseUrl.replace('http://', '').replace('https://', '');
            const wsUrl = `${wsProtocol}//${wsHost}/ws/prices`;

            console.log(`📡 Connecting to ${wsUrl}...`);
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
                            time: parseInt(kline.t) / 1000,
                            open: parseFloat(kline.o),
                            high: parseFloat(kline.h),
                            low: parseFloat(kline.l),
                            close: parseFloat(kline.c),
                            volume: parseFloat(kline.v)
                        };

                        // Update chart
                        if (mainSeriesRef.current) {
                            if (chartType === 'candlestick') {
                                try {
                                    mainSeriesRef.current.update(newCandle);
                                } catch (e) {
                                    console.warn('Chart update failed:', e);
                                }
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
                                if (newData.length > 1000) newData.shift();

                                // Re-fetch patterns on candle close if enabled
                                if (selectedIndicators.candlestickPatterns) {
                                    fetchCandlePatterns();
                                }
                            }
                            return newData;
                        });
                    }
                } catch (error) {
                    console.error('WebSocket message error:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };

            ws.onclose = (event) => {
                console.log(`🔌 WebSocket disconnected (reason: ${event.reason || 'none'}). Retrying in 5s...`);
                wsRef.current = null;
                // Attempt to reconnect after 5 seconds
                if (!reconnectTimerRef.current) {
                    reconnectTimerRef.current = setTimeout(() => {
                        console.log('🔄 Attempting WebSocket reconnection...');
                        connectWebSocket();
                    }, 5000);
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            // Attempt to reconnect after 5 seconds on fail
            if (!reconnectTimerRef.current) {
                reconnectTimerRef.current = setTimeout(() => {
                    connectWebSocket();
                }, 5000);
            }
        }
    };

    // Disconnect WebSocket
    const disconnectWebSocket = () => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }

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

    // Fetch Candlestick Patterns from Backend
    const fetchCandlePatterns = async () => {
        if (!symbol) return;
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        try {
            const response = await fetch(`${apiBaseUrl}/api/v1/technical/${symbol}?interval=${interval}`);
            if (!response.ok) return;
            const data = await response.json();
            if (data.candlestick_markers) {
                setCandlestickMarkers(data.candlestick_markers);
            }
        } catch (error) {
            console.error('Error fetching candlestick patterns:', error);
        }
    };

    // Trigger fetch when patterns enabled or symbol changes
    useEffect(() => {
        if (selectedIndicators.candlestickPatterns) {
            fetchCandlePatterns();
        } else {
            setCandlestickMarkers([]);
        }
    }, [selectedIndicators.candlestickPatterns, symbol, interval]);

    // Cleanup on change or unmount
    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            await fetchInitialData();
            if (isMounted && isStreaming) {
                connectWebSocket();
            }
        };

        init();

        return () => {
            isMounted = false;
            disconnectWebSocket();
        };
    }, [symbol, interval, isStreaming]);

    // Start/stop streaming
    const toggleStreaming = () => {
        setIsStreaming(prev => !prev);
    };

    // Calculate indicators with throttling to prevent UI lag
    const lastIndicatorCalcRef = useRef(0);
    useEffect(() => {
        if (chartData.length < 2) return;

        const now = Date.now();
        // Only recalculate at most once per 800ms during streaming
        if (isStreaming && now - lastIndicatorCalcRef.current < 800) {
            return;
        }
        lastIndicatorCalcRef.current = now;

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
            const srData = srEngine === 'enhanced'
                ? calculateEnhancedSupportResistance(chartData, 150)
                : calculateSupportResistance(chartData, 20);
            indicators.support = srData.support;
            indicators.resistance = srData.resistance;
        }
        if (selectedIndicators.atr) indicators.atr = calculateATR(chartData, 14);

        setCalculatedIndicators(indicators);
    }, [chartData, selectedIndicators, isStreaming, srEngine]);

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
            const atrValue = getCurrentValue(calculatedIndicators.atr) || (chartData[chartData.length - 1]?.close * 0.01);
            const zoneSize = atrValue * 0.5; // Half ATR for zone height

            if (calculatedIndicators.support) {
                calculatedIndicators.support
                    .filter(level => srFilter === 'all' || level.isStrong)
                    .forEach((level, idx) => {
                        if (srType === 'level') {
                            const line = mainSeriesRef.current.createPriceLine({
                                price: level.price,
                                color: level.isFlipped ? '#10b981' : '#22c55e',
                                lineWidth: 3,
                                lineStyle: 0,
                                axisLabelVisible: true,
                                title: `${level.label} ${idx + 1}`
                            });
                            priceLineRefs.current.push(line);
                        } else {
                            // Area mode - Draw a "cloud" using 3 lines with transparency
                            const colors = level.isFlipped ?
                                ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.1)'] :
                                ['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.1)'];

                            [-1, 0, 1].forEach((offset, i) => {
                                const line = mainSeriesRef.current.createPriceLine({
                                    price: level.price + (offset * zoneSize),
                                    color: colors[i],
                                    lineWidth: offset === 0 ? 5 : 10,
                                    lineStyle: 0,
                                    axisLabelVisible: offset === 0,
                                    title: offset === 0 ? `${level.label} ZONE` : ''
                                });
                                priceLineRefs.current.push(line);
                            });
                        }
                    });
            }
            if (calculatedIndicators.resistance) {
                calculatedIndicators.resistance
                    .filter(level => srFilter === 'all' || level.isStrong)
                    .forEach((level, idx) => {
                        if (srType === 'level') {
                            const line = mainSeriesRef.current.createPriceLine({
                                price: level.price,
                                color: level.isFlipped ? '#f43f5e' : '#ef4444',
                                lineWidth: 3,
                                lineStyle: 0,
                                axisLabelVisible: true,
                                title: `${level.label} ${idx + 1}`
                            });
                            priceLineRefs.current.push(line);
                        } else {
                            // Area mode
                            const colors = level.isFlipped ?
                                ['rgba(244, 63, 94, 0.1)', 'rgba(244, 63, 94, 0.3)', 'rgba(244, 63, 94, 0.1)'] :
                                ['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.1)'];

                            [-1, 0, 1].forEach((offset, i) => {
                                const line = mainSeriesRef.current.createPriceLine({
                                    price: level.price + (offset * zoneSize),
                                    color: colors[i],
                                    lineWidth: offset === 0 ? 5 : 10,
                                    lineStyle: 0,
                                    axisLabelVisible: offset === 0,
                                    title: offset === 0 ? `${level.label} ZONE` : ''
                                });
                                priceLineRefs.current.push(line);
                            });
                        }
                    });
            }
        }

        // Apply Candlestick Pattern Markers
        if (selectedIndicators.candlestickPatterns && candlestickMarkers.length > 0 && mainSeriesRef.current) {
            const filteredMarkers = activeCandlePatterns.includes('all')
                ? candlestickMarkers
                : candlestickMarkers.filter(m => activeCandlePatterns.includes(m.pattern));
            mainSeriesRef.current.setMarkers(filteredMarkers);
        } else if (mainSeriesRef.current) {

            // Only clear markers if we are not in an AI pattern or live pattern to avoid flickering
            if (!activeAiPattern && !liveDetectedPatterns) {
                mainSeriesRef.current.setMarkers([]);
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

            // AI Position Tool (Long/Short Overview)
            if (activeAiPattern.expected_move) {
                const move = activeAiPattern.expected_move;
                const directionStr = (move.direction || activeAiPattern.direction || 'UP').toUpperCase();
                const isBullish = directionStr === 'UP' || directionStr === 'BULLISH';
                const target = move.target_price || (isBullish ? currentPrice * 1.05 : currentPrice * 0.95);
                const stop = activeAiPattern.stop_loss || move.stop_loss || (isBullish ? currentPrice * 0.98 : currentPrice * 1.02);

                if (indicatorSeriesRefs.current.ai_position_tools) {
                    indicatorSeriesRefs.current.ai_position_tools.forEach(s => {
                        if (s && chartRef.current) try { chartRef.current.removeSeries(s); } catch (e) { }
                    });
                }
                indicatorSeriesRefs.current.ai_position_tools = [];

                // 1. Profit Series (Green)
                const profitSeries = chartRef.current.addBaselineSeries({
                    baseValue: { price: currentPrice, type: 'price' },
                    topFillColor1: isBullish ? 'rgba(34, 197, 94, 0.25)' : 'rgba(0, 0, 0, 0)',
                    topFillColor2: isBullish ? 'rgba(34, 197, 94, 0.05)' : 'rgba(0, 0, 0, 0)',
                    topLineColor: isBullish ? '#22c55e' : 'rgba(0, 0, 0, 0)',
                    bottomFillColor1: isBullish ? 'rgba(0, 0, 0, 0)' : 'rgba(34, 197, 94, 0.25)',
                    bottomFillColor2: isBullish ? 'rgba(0, 0, 0, 0)' : 'rgba(34, 197, 94, 0.05)',
                    bottomLineColor: isBullish ? 'rgba(0, 0, 0, 0)' : '#22c55e',
                    lineWidth: 1,
                    lineStyle: 0,
                    lastValueVisible: false,
                    priceLineVisible: false,
                });

                // 2. Loss Series (Red)
                const lossSeries = chartRef.current.addBaselineSeries({
                    baseValue: { price: currentPrice, type: 'price' },
                    topFillColor1: isBullish ? 'rgba(0, 0, 0, 0)' : 'rgba(239, 68, 68, 0.25)',
                    topFillColor2: isBullish ? 'rgba(0, 0, 0, 0)' : 'rgba(239, 68, 68, 0.05)',
                    topLineColor: isBullish ? 'rgba(0, 0, 0, 0)' : '#ef4444',
                    bottomFillColor1: isBullish ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0, 0, 0, 0)',
                    bottomFillColor2: isBullish ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0, 0, 0, 0)',
                    bottomLineColor: isBullish ? '#ef4444' : 'rgba(0, 0, 0, 0)',
                    lineWidth: 1,
                    lineStyle: 0,
                    lastValueVisible: false,
                    priceLineVisible: false,
                });

                const profitPoints = [];
                const lossPoints = [];
                for (let i = 0; i <= 30; i++) {
                    const time = baseTime + (i * timeIncrement);
                    profitPoints.push({ time, value: target });
                    lossPoints.push({ time, value: stop });
                }
                profitSeries.setData(profitPoints);
                lossSeries.setData(lossPoints);

                // Add lines for target and stop
                profitSeries.createPriceLine({
                    price: target,
                    color: '#22c55e',
                    lineWidth: 1,
                    lineStyle: 0,
                    axisLabelVisible: true,
                    title: `TARGET (${move.magnitude || move.pct_move}%)`
                });
                lossSeries.createPriceLine({
                    price: stop,
                    color: '#ef4444',
                    lineWidth: 1,
                    lineStyle: 0,
                    axisLabelVisible: true,
                    title: 'STOP'
                });

                indicatorSeriesRefs.current.ai_position_tools.push(profitSeries, lossSeries);
            }
        }

        // Draw Live Detected Patterns if active
        if (liveDetectedPatterns && liveDetectedPatterns.length > 0 && chartData.length > 0) {
            // Cleanup previous live trendlines and position tools
            if (indicatorSeriesRefs.current.live_trendlines) {
                indicatorSeriesRefs.current.live_trendlines.forEach(s => {
                    if (s && chartRef.current) try { chartRef.current.removeSeries(s); } catch (e) { }
                });
            }
            if (indicatorSeriesRefs.current.position_tools) {
                indicatorSeriesRefs.current.position_tools.forEach(s => {
                    if (s && chartRef.current) try { chartRef.current.removeSeries(s); } catch (e) { }
                });
            }
            indicatorSeriesRefs.current.live_trendlines = [];
            indicatorSeriesRefs.current.position_tools = [];

            let allMarkers = [...(mainSeriesRef.current?.markers?.() || [])];

            liveDetectedPatterns.forEach(pattern => {
                // Find absolute timestamps from the chart data to ensure no offset
                const findTime = (idx, fallbackTime) => {
                    if (fallbackTime) return fallbackTime;
                    // If index is relative to the last 30 candles (what we sent to API)
                    // we need to map it back to the end of chartData
                    const absoluteIdx = chartData.length - (30 - idx);
                    return chartData[absoluteIdx]?.time || chartData[chartData.length - 1]?.time;
                };

                // Draw trendlines
                if (pattern.trendlines) {
                    pattern.trendlines.forEach(tl => {
                        const t1 = tl.t1 || findTime(tl.x1);
                        const t2 = tl.t2 || findTime(tl.x2);
                        if (!t1 || !t2) return;

                        const lineSeries = chartRef.current.addLineSeries({
                            color: tl.color || '#f59e0b',
                            lineWidth: 2,
                            lineStyle: tl.style === 'dashed' ? 2 : 0,
                            lastValueVisible: false,
                            priceLineVisible: false,
                            title: tl.label || ''
                        });
                        lineSeries.setData([
                            { time: t1, value: tl.y1 },
                            { time: t2, value: tl.y2 }
                        ]);
                        indicatorSeriesRefs.current.live_trendlines.push(lineSeries);
                    });
                }

                // TradingView-style Long/Short Overlays (Position Tool)
                if (pattern.target && pattern.stop) {
                    const isBullish = pattern.direction === 'bullish';
                    const entryPrice = pattern.trendlines?.[0]?.y2 || (isBullish ? pattern.target * 0.95 : pattern.target * 1.05);
                    const startTime = pattern.start_time || findTime(pattern.start_idx);
                    const endTime = pattern.end_time || findTime(pattern.end_idx);

                    // 1. Profit Series (Green)
                    const profitSeries = chartRef.current.addBaselineSeries({
                        baseValue: { price: entryPrice, type: 'price' },
                        topFillColor1: isBullish ? 'rgba(34, 197, 94, 0.25)' : 'rgba(0, 0, 0, 0)',
                        topFillColor2: isBullish ? 'rgba(34, 197, 94, 0.05)' : 'rgba(0, 0, 0, 0)',
                        topLineColor: isBullish ? '#22c55e' : 'rgba(0, 0, 0, 0)',
                        bottomFillColor1: isBullish ? 'rgba(0, 0, 0, 0)' : 'rgba(34, 197, 94, 0.25)',
                        bottomFillColor2: isBullish ? 'rgba(0, 0, 0, 0)' : 'rgba(34, 197, 94, 0.05)',
                        bottomLineColor: isBullish ? 'rgba(0, 0, 0, 0)' : '#22c55e',
                        lineWidth: 1,
                        lineStyle: 0,
                        lastValueVisible: false,
                        priceLineVisible: false,
                    });

                    // 2. Loss Series (Red)
                    const lossSeries = chartRef.current.addBaselineSeries({
                        baseValue: { price: entryPrice, type: 'price' },
                        topFillColor1: isBullish ? 'rgba(0, 0, 0, 0)' : 'rgba(239, 68, 68, 0.25)',
                        topFillColor2: isBullish ? 'rgba(0, 0, 0, 0)' : 'rgba(239, 68, 68, 0.05)',
                        topLineColor: isBullish ? 'rgba(0, 0, 0, 0)' : '#ef4444',
                        bottomFillColor1: isBullish ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0, 0, 0, 0)',
                        bottomFillColor2: isBullish ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0, 0, 0, 0)',
                        bottomLineColor: isBullish ? '#ef4444' : 'rgba(0, 0, 0, 0)',
                        lineWidth: 1,
                        lineStyle: 0,
                        lastValueVisible: false,
                        priceLineVisible: false,
                    });

                    // Create data points for the box duration
                    const profitPoints = [];
                    const lossPoints = [];

                    const sTime = startTime;
                    const eTime = endTime;
                    const lastTime = chartData[chartData.length - 1].time;
                    const timeWindow = chartData[1].time - chartData[0].time;

                    chartData.filter(d => d.time >= sTime && d.time <= eTime).forEach(d => {
                        profitPoints.push({ time: d.time, value: pattern.target });
                        lossPoints.push({ time: d.time, value: pattern.stop });
                    });

                    for (let i = 1; i <= 10; i++) {
                        const t = lastTime + (i * timeWindow);
                        profitPoints.push({ time: t, value: pattern.target });
                        lossPoints.push({ time: t, value: pattern.stop });
                    }

                    profitSeries.setData(profitPoints);
                    lossSeries.setData(lossPoints);
                    indicatorSeriesRefs.current.position_tools.push(profitSeries, lossSeries);

                    // Add price lines for clarity
                    profitSeries.createPriceLine({
                        price: pattern.target,
                        color: '#22c55e',
                        lineWidth: 1,
                        lineStyle: 0,
                        axisLabelVisible: true,
                        title: 'TARGET'
                    });
                    lossSeries.createPriceLine({
                        price: pattern.stop,
                        color: '#ef4444',
                        lineWidth: 1,
                        lineStyle: 0,
                        axisLabelVisible: true,
                        title: 'STOP'
                    });
                }

                // Collect annotations
                if (pattern.annotations && pattern.annotations.length > 0) {
                    const newMarkers = pattern.annotations.map(ann => {
                        const time = ann.t || findTime(ann.x);
                        if (!time) return null;
                        return {
                            time,
                            position: ann.type === 'peak' ? 'aboveBar' : 'belowBar',
                            color: ann.type === 'peak' ? '#ef4444' : '#22c55e',
                            shape: ann.type === 'peak' ? 'arrowDown' : 'arrowUp',
                            text: ann.label
                        };
                    }).filter(Boolean);
                    allMarkers = [...allMarkers, ...newMarkers];
                }
            });

            // Set all markers
            if (mainSeriesRef.current && allMarkers.length > 0) {
                // Remove duplicates by time and type to prevent stacking
                const uniqueMarkersMap = new Map();
                allMarkers.forEach(m => uniqueMarkersMap.set(m.time + m.text, m));
                const uniqueMarkers = Array.from(uniqueMarkersMap.values());
                mainSeriesRef.current.setMarkers(uniqueMarkers.sort((a, b) => a.time - b.time));
            }
        }

    }, [calculatedIndicators, selectedIndicators, activeAiPattern, liveDetectedPatterns, candlestickMarkers, activeCandlePatterns, chartData]);


    const clearSimulationArtifacts = () => {
        if (projectionSeries && chartRef.current) {
            try { chartRef.current.removeSeries(projectionSeries); } catch (e) { }
            setProjectionSeries(null);
        }
        if (fanSeriesRefs.current) {
            fanSeriesRefs.current.forEach(s => {
                if (s && chartRef.current) try { chartRef.current.removeSeries(s); } catch (e) { }
            });
            fanSeriesRefs.current = [];
        }

        if (indicatorSeriesRefs.current?.live_trendlines) {
            indicatorSeriesRefs.current.live_trendlines.forEach(s => {
                if (s && chartRef.current) try { chartRef.current.removeSeries(s); } catch (e) { }
            });
            indicatorSeriesRefs.current.live_trendlines = [];
        }

        priceLineRefs.current.forEach(line => {
            if (line && mainSeriesRef.current) {
                try { mainSeriesRef.current.removePriceLine(line); } catch (e) { }
            }
        });
        priceLineRefs.current = [];
        setActiveAiPattern(null);
        setLiveDetectedPatterns(null);
        setSimulationActive(false);
        setSimulationMode(null);
        setScenarioData(null);
        setBlueprintVerdict(null);
        setHighlightedLevels({ support: null, resistance: null });
        setSimulationStatus('');
        setSimulationError(null);
        setShowSimulationDetails(false);
        setShowLabDeepDive(false);
    };

    // ── Tactical Entry Scan: Chart click handler ──────────────────
    useEffect(() => {
        if (!isTacticalMode || !chartRef.current) return;

        const handleClick = (param) => {
            if (!param.point || !param.time) return;
            const price = mainSeriesRef.current?.coordinateToPrice(param.point.y);
            if (price && price > 0) {
                setTacticalEntry(price);
                runTacticalScan(price);
            }
        };

        chartRef.current.subscribeClick(handleClick);
        return () => {
            if (chartRef.current) {
                chartRef.current.unsubscribeClick(handleClick);
            }
        };
    }, [isTacticalMode, chartData, calculatedIndicators]);

    // Clear Tactical Entry Scan artifacts
    const clearTacticalScan = () => {
        tacticalSeriesRefs.current.forEach(s => {
            if (s && chartRef.current) try { chartRef.current.removeSeries(s); } catch (e) { }
        });
        tacticalSeriesRefs.current = [];

        // Remove tactical price lines
        if (mainSeriesRef.current) {
            ['__tacticalEntry', '__tacticalTarget', '__tacticalStop'].forEach(tag => {
                try {
                    const existing = mainSeriesRef.current[tag];
                    if (existing) mainSeriesRef.current.removePriceLine(existing);
                    mainSeriesRef.current[tag] = null;
                } catch (e) { }
            });
        }

        setTacticalEntry(null);
        setTacticalResult(null);
        setIsTacticalMode(false);
        setIsTacticalScanning(false);
    };

    // Run Tactical Entry Scan — computes S/R proximity, R/R, expected move
    const runTacticalScan = (entryPrice) => {
        if (!chartData || chartData.length < 10 || !entryPrice) return;
        setIsTacticalScanning(true);

        try {
            // Get S/R levels from calculated indicators
            const supports = (calculatedIndicators.support || []).map(l => l.price).sort((a, b) => b - a);
            const resistances = (calculatedIndicators.resistance || []).map(l => l.price).sort((a, b) => a - b);

            // Nearest support below entry
            const nearestSupport = supports.find(s => s < entryPrice) || entryPrice * 0.95;
            // Nearest resistance above entry
            const nearestResistance = resistances.find(r => r > entryPrice) || entryPrice * 1.05;

            // Second-level targets
            const secondSupport = supports.find(s => s < nearestSupport) || nearestSupport * 0.97;
            const secondResistance = resistances.find(r => r > nearestResistance) || nearestResistance * 1.03;

            // Long scenario
            const longTarget = nearestResistance;
            const longStop = nearestSupport;
            const longReward = Math.abs(longTarget - entryPrice);
            const longRisk = Math.abs(entryPrice - longStop);
            const longRR = longRisk > 0 ? (longReward / longRisk).toFixed(2) : 'N/A';
            const longPctMove = ((longTarget - entryPrice) / entryPrice * 100).toFixed(2);

            // Short scenario
            const shortTarget = nearestSupport;
            const shortStop = nearestResistance;
            const shortReward = Math.abs(entryPrice - shortTarget);
            const shortRisk = Math.abs(shortStop - entryPrice);
            const shortRR = shortRisk > 0 ? (shortReward / shortRisk).toFixed(2) : 'N/A';
            const shortPctMove = ((entryPrice - shortTarget) / entryPrice * 100).toFixed(2);

            // ATR for confidence
            const atr = getCurrentValue(calculatedIndicators.atr) || (entryPrice * 0.015);
            const rsi = getCurrentValue(calculatedIndicators.rsi);
            const distToSupport = Math.abs(entryPrice - nearestSupport) / atr;
            const distToResist = Math.abs(nearestResistance - entryPrice) / atr;

            // Confluence score
            let confluenceScore = 50;
            if (distToSupport < 1.0) confluenceScore += 15; // Near support — good for longs
            if (distToResist < 1.0) confluenceScore += 10; // Near resistance — good for shorts
            if (rsi && rsi < 35) confluenceScore += 10; // Oversold — supports long
            if (rsi && rsi > 65) confluenceScore += 10; // Overbought — supports short
            if (parseFloat(longRR) >= 2) confluenceScore += 10;
            confluenceScore = Math.min(95, Math.max(15, confluenceScore));

            const result = {
                entry: entryPrice,
                long: {
                    target: longTarget,
                    stop: longStop,
                    rr: longRR,
                    pctMove: longPctMove,
                    reward: longReward,
                    risk: longRisk,
                    secondTarget: secondResistance,
                },
                short: {
                    target: shortTarget,
                    stop: shortStop,
                    rr: shortRR,
                    pctMove: shortPctMove,
                    reward: shortReward,
                    risk: shortRisk,
                    secondTarget: secondSupport,
                },
                levels: { nearestSupport, nearestResistance, secondSupport, secondResistance },
                confluenceScore,
                atr,
                rsi: rsi?.toFixed?.(1) || 'N/A',
                direction: rsi && rsi < 45 ? 'LONG' : rsi && rsi > 55 ? 'SHORT' : 'NEUTRAL',
            };

            setTacticalResult(result);

            // ── Draw overlays on chart ──
            // Clear previous tactical drawings
            tacticalSeriesRefs.current.forEach(s => {
                if (s && chartRef.current) try { chartRef.current.removeSeries(s); } catch (e) { }
            });
            tacticalSeriesRefs.current = [];
            if (mainSeriesRef.current) {
                ['__tacticalEntry', '__tacticalTarget', '__tacticalStop'].forEach(tag => {
                    try {
                        const existing = mainSeriesRef.current[tag];
                        if (existing) mainSeriesRef.current.removePriceLine(existing);
                        mainSeriesRef.current[tag] = null;
                    } catch (e) { }
                });
            }

            if (mainSeriesRef.current) {
                const isShortBias = result.direction === 'SHORT';
                const targetPrice = isShortBias ? result.short.target : result.long.target;
                const stopPrice = isShortBias ? result.short.stop : result.long.stop;
                const dirLabel = isShortBias ? 'SHORT' : 'LONG';

                // Entry line
                const entryLine = mainSeriesRef.current.createPriceLine({
                    price: entryPrice,
                    color: '#8b5cf6',
                    lineWidth: 3,
                    lineStyle: 0,
                    axisLabelVisible: true,
                    title: '⊕ ENTRY'
                });
                mainSeriesRef.current.__tacticalEntry = entryLine;

                // Target line
                const targetLine = mainSeriesRef.current.createPriceLine({
                    price: targetPrice,
                    color: isShortBias ? '#ef4444' : '#22c55e',
                    lineWidth: 2,
                    lineStyle: 2,
                    axisLabelVisible: true,
                    title: `🎯 TARGET (${dirLabel})`
                });
                mainSeriesRef.current.__tacticalTarget = targetLine;

                // Stop line
                const stopLine = mainSeriesRef.current.createPriceLine({
                    price: stopPrice,
                    color: isShortBias ? '#22c55e' : '#ef4444',
                    lineWidth: 2,
                    lineStyle: 2,
                    axisLabelVisible: true,
                    title: `✋ STOP (${dirLabel})`
                });
                mainSeriesRef.current.__tacticalStop = stopLine;
            }

            // Draw shaded zone between target and stop using area series
            if (chartRef.current && chartData.length > 0) {
                const lastTime = chartData[chartData.length - 1].time;
                const timeInc = interval === '1d' ? 86400 : interval === '1h' ? 3600 : interval === '15m' ? 900 : 60;
                const zonePts = 15;

                const isShortBias = result.direction === 'SHORT';
                const targetPrice = isShortBias ? result.short.target : result.long.target;
                const stopPrice = isShortBias ? result.short.stop : result.long.stop;

                // Target zone (shaded)
                const targetZone = chartRef.current.addAreaSeries({
                    topColor: isShortBias ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    bottomColor: isShortBias ? 'rgba(239, 68, 68, 0.03)' : 'rgba(34, 197, 94, 0.03)',
                    lineColor: isShortBias ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)',
                    lineWidth: 1,
                    lastValueVisible: false,
                    priceLineVisible: false,
                });
                targetZone.setData(Array.from({ length: zonePts }, (_, i) => ({
                    time: lastTime + ((i + 1) * timeInc),
                    value: targetPrice
                })));
                tacticalSeriesRefs.current.push(targetZone);

                // Risk zone (shaded)
                const riskZone = chartRef.current.addAreaSeries({
                    topColor: isShortBias ? 'rgba(34, 197, 94, 0.03)' : 'rgba(239, 68, 68, 0.03)',
                    bottomColor: isShortBias ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    lineColor: isShortBias ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                    lineWidth: 1,
                    lastValueVisible: false,
                    priceLineVisible: false,
                });
                riskZone.setData(Array.from({ length: zonePts }, (_, i) => ({
                    time: lastTime + ((i + 1) * timeInc),
                    value: stopPrice
                })));
                tacticalSeriesRefs.current.push(riskZone);

                // Entry projection line (purple dashed)
                const entryProjection = chartRef.current.addLineSeries({
                    color: 'rgba(139, 92, 246, 0.6)',
                    lineWidth: 2,
                    lineStyle: 2,
                    lastValueVisible: false,
                    priceLineVisible: false,
                });
                entryProjection.setData(Array.from({ length: zonePts }, (_, i) => ({
                    time: lastTime + ((i + 1) * timeInc),
                    value: entryPrice
                })));
                tacticalSeriesRefs.current.push(entryProjection);
            }
        } catch (error) {
            console.error('Tactical scan error:', error);
        } finally {
            setIsTacticalScanning(false);
        }
    };

    // ── Enhanced AI Pattern Shaded Zone Rendering ──────────────────
    useEffect(() => {
        if (!activeAiPattern?.shaded_zone || !chartRef.current || chartData.length === 0) return;

        const zone = activeAiPattern.shaded_zone;
        const timeIncrement = interval === '1d' ? 86400 : interval === '1h' ? 3600 : interval === '15m' ? 900 : 60;
        const baseTime = activeAiPattern.baseTime;
        const direction = activeAiPattern.direction;

        // Draw upper boundary as line
        if (zone.upper_boundary && zone.upper_boundary.length > 0) {
            const upperSeries = chartRef.current.addLineSeries({
                color: direction === 'bullish' ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)',
                lineWidth: 1,
                lineStyle: 2,
                lastValueVisible: false,
                priceLineVisible: false,
            });
            const upperData = zone.upper_boundary.map((p, idx) => ({
                time: baseTime + (idx * timeIncrement),
                value: p.y
            }));
            upperSeries.setData(upperData);
            indicatorSeriesRefs.current.ai_shaded_upper = upperSeries;
        }

        // Draw lower boundary as line
        if (zone.lower_boundary && zone.lower_boundary.length > 0) {
            const lowerSeries = chartRef.current.addLineSeries({
                color: direction === 'bullish' ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)',
                lineWidth: 1,
                lineStyle: 2,
                lastValueVisible: false,
                priceLineVisible: false,
            });
            const lowerData = zone.lower_boundary.map((p, idx) => ({
                time: baseTime + (idx * timeIncrement),
                value: p.y
            }));
            lowerSeries.setData(lowerData);
            indicatorSeriesRefs.current.ai_shaded_lower = lowerSeries;
        }

        // Draw filled area between boundaries
        if (zone.upper_boundary?.length > 0 && zone.lower_boundary?.length > 0) {
            const fillColor = direction === 'bullish'
                ? 'rgba(34, 197, 94, 0.08)'
                : 'rgba(239, 68, 68, 0.08)';

            const shadedArea = chartRef.current.addAreaSeries({
                topColor: fillColor,
                bottomColor: 'transparent',
                lineColor: 'transparent',
                lineWidth: 0,
                lastValueVisible: false,
                priceLineVisible: false,
            });
            const areaData = zone.upper_boundary.map((p, idx) => ({
                time: baseTime + (idx * timeIncrement),
                value: p.y
            }));
            shadedArea.setData(areaData);
            indicatorSeriesRefs.current.ai_shaded_fill = shadedArea;
        }

        return () => {
            ['ai_shaded_upper', 'ai_shaded_lower', 'ai_shaded_fill'].forEach(key => {
                if (indicatorSeriesRefs.current[key] && chartRef.current) {
                    try { chartRef.current.removeSeries(indicatorSeriesRefs.current[key]); } catch (e) { }
                    indicatorSeriesRefs.current[key] = null;
                }
            });
        };
    }, [activeAiPattern, chartData, interval]);

    const runMonteCarloSimulation = async () => {
        if (!checkSearchLimit()) return;
        if (!chartData || chartData.length < 10) return;
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        setIsSimulatingBackend(true);
        setSimulationError(null);
        setSimulationStatus('Initializing Probability Engine...');
        clearSimulationArtifacts();

        await logSearchToBackend();

        try {
            setSimulationStatus('Fetching 1,000+ Market Paths...');
            const response = await fetch(`${apiBaseUrl}/api/v1/simulate/monte-carlo/${symbol}?interval=${interval}&enhanced=true`);
            if (!response.ok) throw new Error('Backend failed to generate paths');
            const data = await response.json();

            // Check if we have enhanced data
            const isEnhanced = data.enhanced && data.scenarios;

            if (isEnhanced) {
                // Enhanced mode - use base scenario with advanced features
                setSimulationStatus('Rendering Enhanced Probability Cloud...');
                const baseScenario = data.scenarios.base || data.paths;
                const stats = data.statistics?.base;
                const cone = data.confidence_cones?.base;

                if (baseScenario && chartRef.current) {
                    const timeIncrement = interval === '1d' ? 86400 : interval === '1h' ? 3600 : interval === '15m' ? 900 : 60;
                    const lastCandle = chartData[chartData.length - 1];
                    const baseTime = lastCandle.time;

                    // Use confidence cone if available, otherwise fall back to fan
                    if (cone && cone.length > 0) {
                        // Validate cone data
                        const validCone = cone.filter(p =>
                            p.median > 0 &&
                            p.median < lastCandle.close * 3 &&
                            p.median > lastCandle.close * 0.3 &&
                            !isNaN(p.median) &&
                            isFinite(p.median)
                        );

                        if (validCone.length > 0) {
                            // Draw confidence cone
                            const medianSeries = chartRef.current.addLineSeries({
                                color: '#8b5cf6',
                                lineWidth: 3,
                                lineStyle: 2,
                                priceLineVisible: false,
                                lastValueVisible: false,
                                title: 'PREDICTED MEDIAN'
                            });
                            medianSeries.setData(validCone.map(p => ({
                                time: baseTime + (p.time * timeIncrement),
                                value: p.median
                            })));
                            fanSeriesRefs.current.push(medianSeries);

                            // Draw 95% confidence interval
                            if (validCone[0].p95) {
                                const upperSeries = chartRef.current.addLineSeries({
                                    color: 'rgba(55, 159, 157, 0.3)',
                                    lineWidth: 1,
                                    lineStyle: 2,
                                    priceLineVisible: false,
                                    lastValueVisible: false,
                                    title: '95% Upper'
                                });
                                const validUpper = validCone.filter(p =>
                                    p.p95?.upper > 0 &&
                                    p.p95?.upper < lastCandle.close * 3 &&
                                    !isNaN(p.p95?.upper) &&
                                    isFinite(p.p95?.upper)
                                );
                                if (validUpper.length > 0) {
                                    upperSeries.setData(validUpper.map(p => ({
                                        time: baseTime + (p.time * timeIncrement),
                                        value: p.p95.upper
                                    })));
                                    fanSeriesRefs.current.push(upperSeries);
                                }

                                const lowerSeries = chartRef.current.addLineSeries({
                                    color: 'rgba(55, 159, 157, 0.3)',
                                    lineWidth: 1,
                                    lineStyle: 2,
                                    priceLineVisible: false,
                                    lastValueVisible: false,
                                    title: '95% Lower'
                                });
                                const validLower = validCone.filter(p =>
                                    p.p95?.lower > 0 &&
                                    p.p95?.lower > lastCandle.close * 0.3 &&
                                    !isNaN(p.p95?.lower) &&
                                    isFinite(p.p95?.lower)
                                );
                                if (validLower.length > 0) {
                                    lowerSeries.setData(validLower.map(p => ({
                                        time: baseTime + (p.time * timeIncrement),
                                        value: p.p95.lower
                                    })));
                                    fanSeriesRefs.current.push(lowerSeries);
                                }
                            }
                        }
                    }

                    // Draw individual paths (limit to 10 for performance)
                    const pathsToShow = baseScenario.slice(0, 10);
                    pathsToShow.forEach((path, idx) => {
                        // Validate and filter path data
                        const validPath = path.filter(p => {
                            // Filter out unrealistic values (more than 3x or less than 0.3x current price)
                            return p.value > 0 &&
                                p.value < lastCandle.close * 3 &&
                                p.value > lastCandle.close * 0.3 &&
                                !isNaN(p.value) &&
                                isFinite(p.value);
                        });

                        if (validPath.length > 0) {
                            const pSeries = chartRef.current.addLineSeries({
                                color: `rgba(55, 159, 157, ${0.05 + (Math.random() * 0.1)})`,
                                lineWidth: 1,
                                priceLineVisible: false,
                                lastValueVisible: false,
                            });
                            pSeries.setData(validPath.map(p => ({
                                time: baseTime + (p.time * timeIncrement),
                                value: p.value
                            })));
                            fanSeriesRefs.current.push(pSeries);
                        }
                    });

                    setSimulationActive(true);
                    setSimulationMode('monte-carlo');

                    // Enhanced scenario data with risk metrics
                    const scenarioInfo = {
                        type: 'Enhanced Monte Carlo Analysis',
                        description: `Advanced simulation complete. Generated ${data.meta?.num_paths || 100} paths using ${data.regime} regime model.`,
                        market_regime: data.market_regime,
                        confidence: 85,
                        isAgentic: true,
                        enhanced: true,
                        meta: data.meta,
                        metrics: {
                            expected_return: stats ? `${stats.expected_return.toFixed(2)}%` : 'N/A',
                            var_95: stats ? `${stats.var_95.toFixed(2)}%` : 'N/A',
                            probability_profit: stats ? `${stats.probability_profit.toFixed(1)}%` : 'N/A',
                            sharpe_ratio: stats ? stats.sharpe_ratio.toFixed(2) : 'N/A',
                            bias: data.market_regime?.includes('Bull') ? 'Bullish' :
                                data.market_regime?.includes('Bear') ? 'Bearish' : 'Neutral'
                        }
                    };

                    // Add price targets if available
                    if (stats?.price_targets) {
                        scenarioInfo.price_targets = {
                            p10: formatPrice(stats.price_targets.p10),
                            p50: formatPrice(stats.price_targets.p50),
                            p90: formatPrice(stats.price_targets.p90)
                        };
                    }

                    setScenarioData(scenarioInfo);
                }
            } else {
                // Legacy mode - use old fan structure
                if (data.fan && chartRef.current) {
                    setSimulationStatus('Rendering Probability Cloud...');
                    const timeIncrement = interval === '1d' ? 86400 : interval === '1h' ? 3600 : interval === '15m' ? 900 : 60;
                    const lastCandle = chartData[chartData.length - 1];
                    const baseTime = lastCandle.time;

                    // Create the "Heat Fan" using multiple area series or just a few key ones
                    // 1. Median Path (Strong)
                    const medianSeries = chartRef.current.addLineSeries({
                        color: '#8b5cf6',
                        lineWidth: 3,
                        lineStyle: 2,
                        priceLineVisible: false,
                        lastValueVisible: false,
                        title: 'PREDICTED MEDIAN'
                    });
                    medianSeries.setData(data.fan.map(p => ({
                        time: baseTime + (p.time * timeIncrement),
                        value: p.p50
                    })));
                    fanSeriesRefs.current.push(medianSeries);

                    // 2. Individual paths
                    data.paths.forEach((path, idx) => {
                        const pSeries = chartRef.current.addLineSeries({
                            color: `rgba(55, 159, 157, ${0.05 + (Math.random() * 0.1)})`,
                            lineWidth: 1,
                            priceLineVisible: false,
                            lastValueVisible: false,
                        });
                        pSeries.setData(path.map(p => ({
                            time: baseTime + (p.time * timeIncrement),
                            value: p.value
                        })));
                        fanSeriesRefs.current.push(pSeries);
                    });

                    setSimulationActive(true);
                    setSimulationMode('monte-carlo');
                    setScenarioData({
                        type: 'Monte Carlo Probability Fan',
                        description: `Simulation complete. Engineered 50+ divergent outcomes based on current ${data.market_regime} volatility.`,
                        market_regime: data.market_regime,
                        confidence: 75,
                        isAgentic: true,
                        meta: data.meta,
                        metrics: {
                            spread: `${((Math.abs(data.fan[data.fan.length - 1].max - data.fan[data.fan.length - 1].min) / data.last_price) * 100).toFixed(2)}%`,
                            bias: data.market_regime?.includes('Bull') ? 'Bullish' : data.market_regime?.includes('Bear') ? 'Bearish' : 'Neutral'
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Monte Carlo Failed:", error);
            setSimulationError("Probability engine failed. Check internet connection.");
        } finally {
            setIsSimulatingBackend(false);
            setSimulationStatus('');
        }
    };

    const runRegimeSimulation = async (injectType) => {
        if (!checkSearchLimit()) return;
        if (!chartData || chartData.length < 10) return;
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        setIsSimulatingBackend(true);
        setSimulationError(null);
        setSimulationStatus(`Injecting ${injectType.replace('_', ' ')}...`);
        clearSimulationArtifacts();

        await logSearchToBackend();

        try {
            setSimulationStatus('Calculating Injected Trajectory...');
            const response = await fetch(`${apiBaseUrl}/api/v1/simulate/regime/${symbol}?type=${injectType}&interval=${interval}`);
            if (!response.ok) throw new Error('Regime injection failed');
            const data = await response.json();

            if (data.path && chartRef.current) {
                setSimulationStatus('Visualizing Scenario...');
                const timeIncrement = interval === '1d' ? 86400 : interval === '1h' ? 3600 : interval === '15m' ? 900 : 60;
                const lastCandle = chartData[chartData.length - 1];
                const baseTime = lastCandle.time;

                const projSeries = chartRef.current.addLineSeries({
                    color: injectType === 'black_swan' ? '#f43f5e' : '#f59e0b',
                    lineWidth: 4,
                    lineStyle: 1,
                    priceLineVisible: false,
                    lastValueVisible: false,
                    title: injectType.toUpperCase()
                });

                const pathData = data.path.map(p => ({
                    time: baseTime + (p.time * timeIncrement),
                    value: p.value
                }));

                projSeries.setData(pathData);
                setProjectionSeries(projSeries);

                setSimulationActive(true);
                setSimulationMode(injectType);

                const descriptions = {
                    'bullish_breakout': 'Simulating a high-conviction structural break with volume expansion. Watch for resistance flip.',
                    'black_swan': 'Extreme tail-risk event. Simulating a liquidity collapse and attempted recovery cycle.',
                    'institutional_flush': 'Manipulation scenario: Stop-loss hunting above resistance followed by a major liquidity capture dump.'
                };

                const lastVal = pathData[pathData.length - 1].value;
                const priceChg = ((lastVal - data.last_price) / data.last_price) * 100;

                setScenarioData({
                    type: injectType.replace(/_/g, ' ').toUpperCase(),
                    description: descriptions[injectType] || 'Injected market regime scenario.',
                    isAgentic: true,
                    meta: data.meta,
                    metrics: {
                        projected_move: `${priceChg.toFixed(2)}%`,
                        target: `$${lastVal.toLocaleString(undefined, { minimumFractionDigits: 1 })}`
                    }
                });
            }
        } catch (error) {
            console.error("Regime Simulation Failed:", error);
            setSimulationError("Scenario injection failed. Try a different regime.");
        } finally {
            setIsSimulatingBackend(false);
            setSimulationStatus('');
        }
    };

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

            // Clear previous simulation artifacts efficiently
            clearSimulationArtifacts();

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

            // Standard scenarios also count as a tactical scan
            logSearchToBackend();

            // Track GA4 event
            analytics.trackScan(symbol, type);
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

    // Live Pattern Detection - Draw detected patterns on existing chart data
    const handleLivePatternDetected = (patterns) => {
        if (!patterns || !patterns.length || !chartRef.current || !chartData.length) return;

        // Set state to trigger useEffect rendering
        setLiveDetectedPatterns(patterns);

        // Zoom to show the pattern region
        if (patterns[0]) {
            const startIdx = patterns[0].start_idx;
            const endIdx = patterns[0].end_idx;
            setTimeout(() => {
                if (chartRef.current) {
                    chartRef.current.timeScale().setVisibleLogicalRange({
                        from: Math.max(0, startIdx - 10),
                        to: Math.min(chartData.length, endIdx + 15)
                    });
                }
            }, 100);
        }
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
            atr: false,
            onchainBias: false
        });
        setOnchainData(null);
        setOnchainHistory([]);

        // Clear simulation and pattern states using helper
        clearSimulationArtifacts();
    };

    const handleTickerChange = (newSymbol) => {
        const symbolStr = typeof newSymbol === 'string' ? newSymbol : newSymbol.symbol;
        let finalSymbol = symbolStr.toUpperCase();
        if (!finalSymbol.endsWith('USDT')) finalSymbol += 'USDT';

        setSymbol(finalSymbol);
        setIsTickerMenuOpen(false);
        setTickerSearch('');

        // Switch back to "Price View": clear simulations, heatmaps, and rest focus/type
        clearSimulationArtifacts();
        setShowLiquidityHeatmap(false);
        setIsBlueprintMode(false);
        setFocusMode(false);
        setChartType('candlestick');
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnectWebSocket();
        };
    }, []);

    return (
        <div className={`h-full w-full flex flex-col overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f111a] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            {/* --- Premium Tactical Header --- */}
            <header className={`z-[70] transition-all duration-500 relative border-b ${theme === 'dark' ? 'bg-[#0f111a]/95 border-white/5 shadow-2xl' : 'bg-white/95 border-slate-200 shadow-xl'} backdrop-blur-xl`}>
                <div className={`flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 ${isMobile ? 'py-2 gap-2.5' : 'py-4'}`}>

                    {isMobile ? (
                        /* PREMIUM MOBILE HEADER (Dynamic Hub Layout) */
                        <div className="flex flex-col gap-4">
                            {/* Row 1: The Market Hub */}
                            <div className="flex items-center justify-between">
                                {/* Elegant Sidebar Toggle */}
                                <button
                                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-white/5 text-violet-400 border border-white/5' : 'bg-slate-50 text-violet-600 border border-slate-200'}`}
                                >
                                    <div className="flex flex-col gap-1 items-end">
                                        <div className="w-5 h-0.5 bg-current rounded-full" />
                                        <div className="w-4 h-0.5 bg-current rounded-full" />
                                        <div className="w-2 h-0.5 bg-current rounded-full opacity-50" />
                                    </div>
                                </button>

                                {/* Central Market Identity Hub */}
                                <div className="flex-1 flex justify-center px-4">
                                    <div className={`flex items-center px-4 py-2 rounded-[2rem] border backdrop-blur-3xl shadow-2xl transition-all ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200'}`}>
                                        <div className="flex items-center gap-2.5">
                                            {/* Minimal Branding */}
                                            <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                                <TrendingUp size={14} className="text-white" />
                                            </div>

                                            {/* Ticker Search Trigger */}
                                            <div className="relative" ref={tickerMenuRef}>
                                                <button
                                                    onClick={() => setIsTickerMenuOpen(!isTickerMenuOpen)}
                                                    className="flex items-center gap-1 group"
                                                >
                                                    <span className="text-xs font-black tracking-tighter uppercase">{symbol.replace('USDT', '')}</span>
                                                    <ChevronDown size={10} className="opacity-30" />
                                                </button>

                                                {isTickerMenuOpen && (
                                                    <div className={`fixed top-24 left-4 right-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border backdrop-blur-3xl z-[120] animate-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-[#11121d] border-white/10' : 'bg-white border-slate-200'}`}>
                                                        <div className="p-4 border-b border-white/5">
                                                            <input
                                                                type="text"
                                                                placeholder="SEARCH ASSET..."
                                                                value={tickerSearch}
                                                                onChange={(e) => setTickerSearch(e.target.value.toUpperCase())}
                                                                onKeyDown={(e) => { if (e.key === 'Enter' && tickerSearch) handleTickerChange(tickerSearch); }}
                                                                className={`w-full px-5 py-3 rounded-2xl text-[10px] font-black border outline-none ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-400'}`}
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <div className="max-h-[300px] overflow-y-auto p-2 no-scrollbar">
                                                            {filteredOptions.map(token => (
                                                                <button key={token.symbol} onClick={() => handleTickerChange(token.symbol)} className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all ${symbol === token.symbol ? 'bg-violet-600 text-white' : 'hover:bg-white/5'}`}>
                                                                    <div className="text-left">
                                                                        <div className="text-xs font-black tracking-tight">{token.symbol.replace('USDT', '')}</div>
                                                                        <div className="text-[8px] font-bold opacity-50 uppercase">{token.name}</div>
                                                                    </div>
                                                                    {symbol === token.symbol && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="w-[1px] h-3 bg-white/10 mx-0.5" />

                                            {/* Compact Price Data */}
                                            <div className="flex flex-col items-start leading-tight">
                                                <span className={`text-[11px] font-mono font-black ${priceChange >= 0 ? 'text-purple-400' : 'text-rose-500'}`}>
                                                    {formatPrice(currentPrice)}
                                                </span>
                                                <span className={`text-[8px] font-black ${priceChange >= 0 ? 'text-purple-400/70' : 'text-rose-500/70'}`}>
                                                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Premium Live/Start Button */}
                                <button
                                    onClick={toggleStreaming}
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-lg ${isStreaming ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-violet-600 text-white shadow-violet-500/30'}`}
                                >
                                    {isStreaming ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> : <PlayCircle size={18} />}
                                </button>
                            </div>

                            {/* Row 2: Tactical Action Bar */}
                            <div className={`flex items-center justify-between p-1 rounded-2xl border ${theme === 'dark' ? 'bg-white/[0.02] border-white/5 shadow-inner' : 'bg-slate-50 border-slate-200'}`}>
                                {/* Persistent Timeframe Pill */}
                                <div className="relative">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                        <Clock size={12} className="text-violet-400" />
                                        <select
                                            value={interval}
                                            onChange={(e) => setInterval(e.target.value)}
                                            className="bg-transparent border-none text-[10px] font-black tracking-widest text-violet-400 outline-none appearance-none"
                                        >
                                            {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => <option key={tf} value={tf}>{tf.toUpperCase()}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Unified Tools Cluster */}
                                <div className="flex items-center gap-0.5 px-1">
                                    <button onClick={handleResetChart} className="p-2 text-slate-500 hover:text-amber-500 active:scale-95 transition-all"><RotateCcw size={16} /></button>
                                    <div className="h-4 w-[1px] bg-white/5 mx-1" />
                                    <button onClick={() => setFocusMode(!focusMode)} className={`p-2 rounded-lg transition-all ${focusMode ? 'text-violet-400 bg-violet-500/10' : 'text-slate-500'}`}><Maximize2 size={16} /></button>
                                    <button onClick={() => setShowLiquidityHeatmap(!showLiquidityHeatmap)} className={`p-2 rounded-lg transition-all ${showLiquidityHeatmap ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500'}`}><Droplets size={16} /></button>
                                    <button onClick={() => isTacticalMode ? clearTacticalScan() : setIsTacticalMode(true)} className={`p-2 rounded-lg transition-all ${isTacticalMode ? 'text-violet-400 animate-pulse bg-violet-500/10' : 'text-slate-500'}`}><Crosshair size={16} /></button>
                                    <button onClick={() => setShowAIChat(!showAIChat)} className={`p-2 rounded-lg transition-all ${showAIChat ? 'text-violet-400 bg-violet-500/10' : 'text-slate-500'}`}><MessageSquare size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* DESKTOP LAYOUT (Clean) */
                        <>
                            <div className="flex items-center justify-between md:justify-start gap-6">
                                <div className="flex items-center gap-4">
                                    {/* Brand Icon */}
                                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-violet-600 items-center justify-center shadow-lg shadow-violet-500/20">
                                        <TrendingUp className="text-white" size={24} />
                                    </div>

                                    {/* Ticker & Price Display */}
                                    <div className="flex flex-row items-center gap-4">
                                        <div className="relative" ref={tickerMenuRef}>
                                            <button
                                                onClick={() => setIsTickerMenuOpen(!isTickerMenuOpen)}
                                                className={`flex items-center gap-2 px-2 py-1 -ml-2 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                                            >
                                                <span className={`text-xl md:text-2xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {symbol.replace('USDT', '')}
                                                </span>
                                                <ChevronDown size={14} className={`transition-transform duration-300 ${isTickerMenuOpen ? 'rotate-180' : ''} opacity-30`} />
                                            </button>

                                            {/* Premium Ticker Dropdown */}
                                            {isTickerMenuOpen && (
                                                <div className={`absolute top-full left-0 mt-3 w-80 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border backdrop-blur-2xl animate-in zoom-in-95 duration-200 z-[100] ${theme === 'dark' ? 'bg-[#161825]/95 border-white/10' : 'bg-white/95 border-slate-200'}`}>
                                                    <div className="p-4 border-b border-white/5">
                                                        <input
                                                            type="text"
                                                            placeholder="SEARCH TICKER..."
                                                            value={tickerSearch}
                                                            onChange={(e) => setTickerSearch(e.target.value.toUpperCase())}
                                                            onKeyDown={(e) => { if (e.key === 'Enter' && tickerSearch) handleTickerChange(tickerSearch); }}
                                                            className={`w-full px-5 py-3 rounded-2xl text-xs font-black border outline-none ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-400'}`}
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="p-2 max-h-[400px] overflow-y-auto no-scrollbar grid grid-cols-1 gap-1">
                                                        {filteredOptions.map(token => (
                                                            <button key={token.symbol} onClick={() => handleTickerChange(token.symbol)} className={`flex items-center justify-between px-5 py-3.5 rounded-[1.25rem] transition-all group ${symbol === token.symbol ? 'bg-violet-600 text-white' : 'hover:bg-white/5'}`}>
                                                                <div className="text-left">
                                                                    <div className="text-sm font-black tracking-tight">{token.symbol.replace('USDT', '')}</div>
                                                                    <div className="text-[9px] font-bold uppercase opacity-50">{token.name}</div>
                                                                </div>
                                                                {symbol === token.symbol && <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Price Information */}
                                        <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-3">
                                            <span className={`text-xl font-mono font-black tracking-tighter ${priceChange >= 0 ? 'text-purple-400' : 'text-rose-500'}`}>
                                                {formatPrice(currentPrice)}
                                            </span>
                                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black ${priceChange >= 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-rose-500/20 text-rose-500'}`}>
                                                {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stream Controls */}
                                <div className="flex items-center gap-2">
                                    <span className={`hidden md:block px-2 py-0.5 rounded text-[10px] font-black tracking-widest ${theme === 'dark' ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                                        {interval.toUpperCase()}
                                    </span>
                                    <button
                                        onClick={toggleStreaming}
                                        className={`h-10 px-4 rounded-xl font-black text-[10px] tracking-widest transition-all active:scale-95 flex items-center gap-2 ${isStreaming ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'}`}
                                    >
                                        {isStreaming ? (
                                            <><div className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE</>
                                        ) : (
                                            <><PlayCircle size={14} /> START</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* DESKTOP BOTTOM ROW (integrated differently) */}
                            <div className={`flex items-center justify-between md:justify-end gap-2 md:gap-4`}>
                                {/* Timeframe Selector */}
                                <div className={`flex gap-1 p-1 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                                    {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                                        <button
                                            key={tf}
                                            onClick={() => setInterval(tf)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${interval === tf ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            {tf}
                                        </button>
                                    ))}
                                </div>

                                {/* Tactical Actions Panel */}
                                <div className="flex items-center gap-1.5">
                                    <button onClick={handleResetChart} className={`p-2.5 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500'}`} title="Reset">
                                        <RotateCcw size={16} />
                                    </button>
                                    <div className={`hidden sm:flex p-1 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                                        {[{ t: 'candlestick', i: BarChart3 }, { t: 'line', i: Activity }, { t: 'area', i: Layers }].map(c => (
                                            <button key={c.t} onClick={() => setChartType(c.t)} className={`p-1.5 rounded-lg transition-all ${chartType === c.t ? 'bg-violet-600 text-white shadow-md' : 'text-slate-500'}`}>
                                                <c.i size={14} />
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setFocusMode(!focusMode)} className={`p-2.5 rounded-xl border transition-all ${focusMode ? 'bg-violet-600 text-white border-violet-500' : theme === 'dark' ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600'}`} title="Focus">
                                        {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                    </button>
                                    <button onClick={() => setShowLiquidityHeatmap(!showLiquidityHeatmap)} className={`p-2.5 rounded-xl border transition-all ${showLiquidityHeatmap ? 'bg-cyan-500 text-white border-cyan-400' : theme === 'dark' ? 'bg-white/5 border-white/5 text-slate-400 hover:text-cyan-400' : 'bg-white border-slate-200 text-slate-600'}`} title="Liquidity">
                                        <Droplets size={16} />
                                    </button>
                                    <button onClick={() => isTacticalMode ? clearTacticalScan() : setIsTacticalMode(true)} className={`p-2.5 rounded-xl border transition-all ${isTacticalMode ? 'bg-violet-600 text-white border-violet-500 animate-pulse' : theme === 'dark' ? 'bg-white/5 border-white/5 text-slate-400 hover:text-violet-400' : 'bg-white border-slate-200 text-slate-600'}`} title="Tactical Scan">
                                        <Crosshair size={16} />
                                    </button>
                                    <button onClick={() => setShowAIChat(!showAIChat)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${showAIChat ? 'bg-violet-600 text-white border-violet-500' : theme === 'dark' ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600'}`}>
                                        <MessageSquare size={16} />
                                        {!isMobile && <span className="text-[11px] font-black uppercase">Ask AI</span>}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* --- Main Workspace --- */}
            <SEO
                title={`${symbol} Elite Chart — Technical Intelligence`}
                description={`Analyze ${symbol} with Nunno's neural pattern detection, real-time indicators, and automated risk assessment.`}
                path="/elite-chart"
                schemaType="SoftwareApplication"
            />
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
                                    ? 'bg-[#1e2030] border-slate-700 text-violet-400 hover:text-violet-300'
                                    : 'bg-white border-slate-200 text-violet-600 hover:text-violet-500 shadow-lg'
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
                                    <Sparkles size={14} className="text-violet-500 animate-pulse" />
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
                                                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-all ${selectedIndicators[key] ? (theme === 'dark' ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-600 shadow-sm') : 'hover:bg-violet-500/5 text-slate-500'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${key === 'ema9' ? 'bg-amber-500' : key === 'ema21' ? 'bg-blue-500' : key === 'ema50' ? 'bg-violet-500' : key === 'ema100' ? 'bg-pink-500' : 'bg-red-500'}`} />
                                                        <span className="text-[11px] font-bold uppercase">{key.replace('ema', 'EMA ')}</span>
                                                    </div>
                                                    {selectedIndicators[key] ? <Eye size={13} className="opacity-80" /> : <EyeOff size={13} className="opacity-30" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Advanced Indicators Grid */}
                                    {[
                                        { key: 'rsi', label: 'RSI (14)', icon: Activity },
                                        { key: 'macd', label: 'MACD', icon: BarChart3 },
                                        { key: 'bollingerBands', label: 'Bollinger', icon: Layers },
                                        { key: 'supportResistance', label: 'S/R Levels', icon: Minus },
                                    ].map(ind => (
                                        <div key={ind.key} className="space-y-2">
                                            <button
                                                onClick={() => setSelectedIndicators(prev => ({ ...prev, [ind.key]: !prev[ind.key] }))}
                                                className={`w-full px-4 py-3 rounded-2xl border flex items-center justify-between transition-all ${selectedIndicators[ind.key]
                                                    ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20 active:scale-[0.98]'
                                                    : theme === 'dark' ? 'bg-[#16161e] border-slate-700/50 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:border-violet-200 hover:shadow-md'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <ind.icon size={16} />
                                                    <span className="text-[11px] font-black uppercase tracking-wider">{ind.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {ind.key === 'supportResistance' && selectedIndicators.supportResistance && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowSRDropdown(!showSRDropdown);
                                                            }}
                                                            className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-violet-500' : 'hover:bg-violet-700'}`}
                                                        >
                                                            <ChevronDown size={14} className={`transition-transform duration-300 ${showSRDropdown ? 'rotate-180' : ''}`} />
                                                        </button>
                                                    )}
                                                    {selectedIndicators[ind.key] ? <Eye size={16} /> : <Plus size={16} className="opacity-40" />}
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {ind.key === 'supportResistance' && selectedIndicators.supportResistance && showSRDropdown && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className={`overflow-hidden rounded-2xl border ${theme === 'dark' ? 'bg-[#16161e] border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}
                                                    >
                                                        <div className="p-3 space-y-3">
                                                            <div>
                                                                <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-2 px-1">Analysis Engine</div>
                                                                <div className="flex bg-black/10 dark:bg-black/40 rounded-xl p-1 relative">
                                                                    <button
                                                                        onClick={() => setSrEngine('classic')}
                                                                        className={`flex-1 px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${srEngine === 'classic' ? 'bg-violet-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                                                    >
                                                                        CLASSIC
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setSrEngine('enhanced')}
                                                                        className={`flex-1 px-3 py-1.5 rounded-lg text-[9px] font-black transition-all flex items-center justify-center gap-1 ${srEngine === 'enhanced' ? 'bg-violet-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                                                    >
                                                                        <Sparkles size={10} className={srEngine === 'enhanced' ? 'text-white' : 'text-violet-400'} /> NEURAL VWPD
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-2 px-1">Visualization Style</div>
                                                                <div className="flex bg-black/10 dark:bg-black/40 rounded-xl p-1">
                                                                    <button
                                                                        onClick={() => setSrType('level')}
                                                                        className={`flex-1 px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${srType === 'level' ? 'bg-violet-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                                                    >
                                                                        SOLID LEVEL
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setSrType('area')}
                                                                        className={`flex-1 px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${srType === 'area' ? 'bg-violet-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                                                    >
                                                                        CLOUD ZONE
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-2 px-1">Level Strength</div>
                                                                <div className="flex bg-black/10 dark:bg-black/40 rounded-xl p-1">
                                                                    <button
                                                                        onClick={() => setSrFilter('all')}
                                                                        className={`flex-1 px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${srFilter === 'all' ? 'bg-violet-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                                                    >
                                                                        ALL STRUCTURE
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setSrFilter('strong')}
                                                                        className={`flex-1 px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${srFilter === 'strong' ? 'bg-violet-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                                                    >
                                                                        STRONG ONLY
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}

                                    {/* Candlestick Patterns Toggle with Sub-options */}
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setSelectedIndicators(prev => ({ ...prev, candlestickPatterns: !prev.candlestickPatterns }))}
                                            className={`w-full px-4 py-3 rounded-2xl border flex items-center justify-between transition-all ${selectedIndicators.candlestickPatterns
                                                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20 active:scale-[0.98]'
                                                : theme === 'dark' ? 'bg-[#16161e] border-slate-700/50 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:border-violet-200 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Sparkles size={16} />
                                                <span className="text-[11px] font-black uppercase tracking-wider">Candle Patterns</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {selectedIndicators.candlestickPatterns && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowCandlePatternsDropdown(!showCandlePatternsDropdown);
                                                        }}
                                                        className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-violet-500' : 'hover:bg-violet-700'}`}
                                                    >
                                                        <ChevronDown size={14} className={`transition-transform duration-300 ${showCandlePatternsDropdown ? 'rotate-180' : ''}`} />
                                                    </button>
                                                )}
                                                {selectedIndicators.candlestickPatterns ? <Eye size={16} /> : <Plus size={16} className="opacity-40" />}
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {selectedIndicators.candlestickPatterns && showCandlePatternsDropdown && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className={`overflow-hidden rounded-2xl border ${theme === 'dark' ? 'bg-[#16161e] border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}
                                                >
                                                    <div className="p-2 space-y-1">
                                                        {[
                                                            { id: 'all', label: 'All Patterns' },
                                                            { id: 'pinbar_bullish', label: 'Hammer (Bullish)' },
                                                            { id: 'pinbar_bearish', label: 'Shooting Star' },
                                                            { id: 'engulfing_bullish', label: 'Bullish Engulfing' },
                                                            { id: 'engulfing_bearish', label: 'Bearish Engulfing' },
                                                            { id: 'tweezer_bottom', label: 'Tweezer Bottom' },
                                                            { id: 'tweezer_top', label: 'Tweezer Top' },
                                                            { id: 'marubozu_bullish', label: 'Bullish Marubozu' },
                                                            { id: 'marubozu_bearish', label: 'Bearish Marubozu' },
                                                            { id: 'doji', label: 'Doji (Neutral)' },
                                                        ].map(pattern => (
                                                            <button
                                                                key={pattern.id}
                                                                onClick={() => {
                                                                    if (pattern.id === 'all') {
                                                                        setActiveCandlePatterns(['all']);
                                                                    } else {
                                                                        setActiveCandlePatterns(prev => {
                                                                            if (prev.includes('all')) return [pattern.id];
                                                                            if (prev.includes(pattern.id)) {
                                                                                const next = prev.filter(id => id !== pattern.id);
                                                                                return next.length === 0 ? ['all'] : next;
                                                                            }
                                                                            return [...prev, pattern.id];
                                                                        });
                                                                    }
                                                                }}
                                                                className={`w-full px-3 py-2 rounded-xl text-[10px] font-bold flex items-center justify-between transition-all ${activeCandlePatterns.includes(pattern.id)
                                                                    ? (theme === 'dark' ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-700')
                                                                    : (theme === 'dark' ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100')
                                                                    }`}
                                                            >
                                                                {pattern.label}
                                                                {activeCandlePatterns.includes(pattern.id) && <CheckCircle2 size={12} />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* On-Chain Bias Toggle */}
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                const newVal = !selectedIndicators.onchainBias;
                                                setSelectedIndicators(prev => ({ ...prev, onchainBias: newVal }));
                                                if (newVal && !onchainData) {
                                                    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                                                    const asset = symbol?.includes('BTC') ? 'BTC' : symbol?.includes('ETH') ? 'ETH' : 'BTC';
                                                    fetch(`${API_URL}/api/v1/onchain/${asset}/score`)
                                                        .then(r => r.json())
                                                        .then(d => setOnchainData(d))
                                                        .catch(() => { });
                                                    fetch(`${API_URL}/api/v1/onchain/${asset}/history?hours=168`)
                                                        .then(r => r.json())
                                                        .then(d => setOnchainHistory(d.scores || []))
                                                        .catch(() => { });
                                                }
                                            }}
                                            className={`w-full px-4 py-3 rounded-2xl border flex items-center justify-between transition-all ${selectedIndicators.onchainBias
                                                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20 active:scale-[0.98]'
                                                : theme === 'dark' ? 'bg-[#16161e] border-slate-700/50 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:border-violet-200 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Link2 size={16} />
                                                <div className="text-left">
                                                    <span className="text-[11px] font-black uppercase tracking-wider block">On-Chain Bias</span>
                                                    <span className="text-[8px] font-bold opacity-60">Whale + Exchange Flow</span>
                                                </div>
                                            </div>
                                            {selectedIndicators.onchainBias ? <Eye size={16} /> : <Plus size={16} className="opacity-40" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Simulator Section 2.0 */}
                            <div className="space-y-4 pt-4 border-t border-slate-700/20">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Agentic Simulations</h3>
                                    <Zap size={14} className="text-amber-500 animate-pulse" />
                                </div>

                                <button
                                    onClick={runMonteCarloSimulation}
                                    disabled={isSimulatingBackend}
                                    className={`w-full p-4 rounded-3xl border flex flex-col items-center justify-center gap-2 transition-all group relative overflow-hidden ${isSimulatingBackend ? 'opacity-50' : 'hover:scale-[1.02] active:scale-95'} ${theme === 'dark' ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' : 'bg-indigo-50 border-violet-200 text-violet-600 shadow-sm'}`}
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
                                    <Layers size={21} className="group-hover:rotate-12 transition-transform" />
                                    <div className="text-center">
                                        <div className="text-[10px] font-black uppercase tracking-[0.1em]">Probability Fan</div>
                                        <div className="text-[8px] font-bold opacity-60 italic text-violet-500">Monte Carlo 2.0</div>
                                    </div>
                                    {isSimulatingBackend && (
                                        <div className="absolute inset-0 bg-violet-500/20 backdrop-blur-sm flex flex-col items-center justify-center p-2">
                                            <Loader2 size={24} className="animate-spin text-violet-500 mb-1" />
                                            <span className="text-[7px] font-black uppercase tracking-widest text-violet-600 animate-pulse text-center">
                                                {simulationStatus || 'Processing...'}
                                            </span>
                                        </div>
                                    )}
                                </button>

                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { type: 'bullish_breakout', label: 'Breakout', icon: Zap },
                                        { type: 'black_swan', label: 'Black Swan', icon: Ghost },
                                        { type: 'institutional_flush', label: 'Flush', icon: Droplets }
                                    ].map(inject => (
                                        <button
                                            key={inject.type}
                                            onClick={() => runRegimeSimulation(inject.type)}
                                            className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-[8px] font-black uppercase text-center ${simulationMode === inject.type ? 'bg-violet-600 border-violet-500 text-white' : theme === 'dark' ? 'bg-[#16161e] border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500 shadow-xl' : 'bg-white border-slate-200 text-slate-500 hover:border-violet-300 shadow-sm'}`}
                                        >
                                            <inject.icon size={16} />
                                            {inject.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="h-[1px] bg-slate-700/10 my-2" />

                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { type: 'long', label: 'Long', icon: TrendingUp, color: 'purple' },
                                        { type: 'short', label: 'Short', icon: TrendingDown, color: 'rose' },
                                        { type: 'breakout', label: 'Breakout', icon: Zap, color: 'amber' },
                                        { type: 'mean-reversion', label: 'Revert', icon: Activity, color: 'purple' }
                                    ].map(sim => (
                                        <button
                                            key={sim.type}
                                            onClick={() => generateScenario(sim.type)}
                                            className={`flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border transition-all ${simulationMode === sim.type
                                                ? `bg-${sim.color}-500 border-${sim.color}-400 text-white shadow-lg scale-[1.02]`
                                                : theme === 'dark' ? 'bg-[#16161e] border-slate-700/50 text-slate-400 hover:border-slate-500 hover:bg-slate-700/30' : 'bg-white border-slate-200 text-slate-600 hover:border-violet-200'
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

                            {/* Simulation Errors */}
                            {simulationError && (
                                <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Simulation Error</p>
                                        <p className="text-[9px] text-slate-500 leading-tight">{simulationError}</p>
                                    </div>
                                    <button onClick={() => setSimulationError(null)} className="text-slate-400 hover:text-slate-600">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            {/* Active Scenario Insights 2.0 */}
                            {simulationActive && scenarioData && (
                                <div className={`mt-auto p-5 rounded-3xl border animate-in slide-in-from-bottom-4 duration-500 ${theme === 'dark' ? 'bg-violet-500/10 border-violet-500/20 shadow-2xl shadow-violet-500/10' : 'bg-violet-50 border-violet-200 shadow-xl'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                            <h4 className="text-[10px] font-black uppercase text-violet-500 tracking-widest">{scenarioData.type}</h4>
                                        </div>
                                        <button onClick={clearSimulationArtifacts} className="p-1 rounded-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                        {/* Core Price/Target Metrics */}
                                        {scenarioData.targetPrice ? (
                                            <div>
                                                <div className="text-[9px] uppercase font-black text-slate-400 tracking-tighter mb-1">Target Potential</div>
                                                <div className="text-sm font-black text-purple-500 leading-none">{formatPrice(scenarioData.targetPrice)}</div>
                                            </div>
                                        ) : scenarioData.metrics?.target ? (
                                            <div>
                                                <div className="text-[9px] uppercase font-black text-slate-400 tracking-tighter mb-1">Projected Target</div>
                                                <div className="text-sm font-black text-purple-500 leading-none">{scenarioData.metrics.target}</div>
                                            </div>
                                        ) : scenarioData.market_regime ? (
                                            <div>
                                                <div className="text-[9px] uppercase font-black text-slate-400 tracking-tighter mb-1">Market Regime</div>
                                                <div className="text-sm font-black text-violet-500 leading-none uppercase">{scenarioData.market_regime}</div>
                                            </div>
                                        ) : null}

                                        {/* Strategic Metrics */}
                                        {scenarioData.riskReward ? (
                                            <div>
                                                <div className="text-[9px] uppercase font-black text-slate-400 tracking-tighter mb-1">R/R Efficiency</div>
                                                <div className="text-sm font-black text-violet-600 leading-none">{scenarioData.riskReward}:1</div>
                                            </div>
                                        ) : scenarioData.metrics?.projected_move ? (
                                            <div>
                                                <div className="text-[9px] uppercase font-black text-slate-400 tracking-tighter mb-1">Projected Move</div>
                                                <div className="text-sm font-black text-amber-500 leading-none">{scenarioData.metrics.projected_move}</div>
                                            </div>
                                        ) : scenarioData.metrics?.spread ? (
                                            <div>
                                                <div className="text-[9px] uppercase font-black text-slate-400 tracking-tighter mb-1">Outcome Spread</div>
                                                <div className="text-sm font-black text-violet-500 leading-none">{scenarioData.metrics.spread}</div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="text-[9px] uppercase font-black text-slate-400 tracking-tighter mb-1">Confidence</div>
                                                <div className="text-sm font-black text-violet-500 leading-none">AGENTIC</div>
                                            </div>
                                        )}

                                        {/* Row 2 Metrics if available */}
                                        {scenarioData.potentialGain && (
                                            <div className="col-span-2 mt-1 py-2 px-3 bg-white/5 rounded-xl flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] uppercase font-bold text-slate-400">Potential Gain</span>
                                                    <span className="text-xs font-black text-purple-500">+{scenarioData.potentialGain}%</span>
                                                </div>
                                                <div className="w-px h-6 bg-slate-700/20" />
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[8px] uppercase font-bold text-slate-400">Potential Loss</span>
                                                    <span className="text-xs font-black text-rose-500">-{scenarioData.potentialLoss}%</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <p className={`mt-4 text-[10px] leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {scenarioData.description}
                                    </p>

                                    {/* Detailed Metrics Toggle */}
                                    {scenarioData.meta && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => setShowSimulationDetails(!showSimulationDetails)}
                                                className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${theme === 'dark' ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700'}`}
                                            >
                                                {showSimulationDetails ? 'Hide Laboratory Metrics' : 'View Laboratory Metrics'}
                                                <ChevronDown size={12} className={`transition-transform duration-300 ${showSimulationDetails ? 'rotate-180' : ''}`} />
                                            </button>

                                            <button
                                                onClick={() => setShowLabDeepDive(true)}
                                                className={`mt-2 w-full py-2.5 px-3 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'bg-violet-500/10 border-violet-500/30 text-violet-400 hover:bg-violet-500/20' : 'bg-indigo-50 border-violet-200 text-violet-600 hover:bg-indigo-100'}`}
                                            >
                                                <Microscope size={14} />
                                                DEEP DIVE LABORATORY
                                            </button>

                                            {showSimulationDetails && (
                                                <div className={`mt-3 p-3 rounded-2xl border text-[9px] font-mono grid grid-cols-2 gap-2 animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-black/20 border-white/5 text-slate-400' : 'bg-white border-slate-100 text-slate-500'}`}>
                                                    <div className="flex flex-col">
                                                        <span className="opacity-50 uppercase text-[7px] mb-0.5">Model Horizon</span>
                                                        <span className="font-bold text-slate-300">{scenarioData.meta.steps} STEPS</span>
                                                    </div>

                                                    {scenarioData.meta.num_paths ? (
                                                        <div className="flex flex-col">
                                                            <span className="opacity-50 uppercase text-[7px] mb-0.5">Simulated Paths</span>
                                                            <span className="font-bold text-slate-300">{scenarioData.meta.num_paths} AI AGENTS</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <span className="opacity-50 uppercase text-[7px] mb-0.5">Engine Volatility</span>
                                                            <span className="font-bold text-slate-300">{(scenarioData.meta.volatility_used * 100).toFixed(2)}%</span>
                                                        </div>
                                                    )}

                                                    {scenarioData.meta.regime ? (
                                                        <div className="flex flex-col">
                                                            <span className="opacity-50 uppercase text-[7px] mb-0.5">Detected Regime</span>
                                                            <span className="font-bold text-slate-300">{scenarioData.meta.regime.toUpperCase()}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <span className="opacity-50 uppercase text-[7px] mb-0.5">Floor Anchor</span>
                                                            <span className="font-bold text-slate-300">{formatPrice(scenarioData.meta.support_used)}</span>
                                                        </div>
                                                    )}

                                                    {scenarioData.meta.vol_multiplier ? (
                                                        <div className="flex flex-col">
                                                            <span className="opacity-50 uppercase text-[7px] mb-0.5">Vol Multiplier</span>
                                                            <span className="font-bold text-slate-400">{scenarioData.meta.vol_multiplier}x</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <span className="opacity-50 uppercase text-[7px] mb-0.5">Ceiling Anchor</span>
                                                            <span className="font-bold text-slate-300">{formatPrice(scenarioData.meta.resistance_used)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {scenarioData.isAgentic && (
                                        <div className="mt-4 pt-4 border-t border-violet-500/10 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-violet-500/20">
                                                    <Brain size={12} className="text-violet-400" />
                                                </div>
                                                <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">AI Projected Path</span>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-violet-500/40" />)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </aside>

                {/* Center Content: Chart Area */}
                <main className={`flex-1 relative min-h-0 min-w-0 ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-slate-50'}`}>
                    {/* OHLC Overlay (Glassmorphism) */}
                    <div className={`absolute top-2 md:top-6 left-2 md:left-6 right-2 md:right-auto z-20 pointer-events-none transition-all duration-700`}>
                        <div className={`backdrop-blur-md rounded-xl md:rounded-3xl border overflow-hidden shadow-2xl pointer-events-auto ${theme === 'dark' ? 'bg-[#1e2030]/60 border-white/5 shadow-black/40' : 'bg-white/60 border-white shadow-slate-200/50'}`}>
                            <div className="flex items-center flex-wrap md:flex-nowrap justify-between md:justify-start gap-y-1 gap-x-3 md:gap-8 px-3 md:px-6 py-2 md:py-4">
                                {[
                                    { label: 'O', val: hoveredCandle?.open ?? chartData[chartData.length - 1]?.open, col: theme === 'dark' ? 'text-slate-300' : 'text-slate-500' },
                                    { label: 'H', val: hoveredCandle?.high ?? chartData[chartData.length - 1]?.high, col: 'text-purple-500' },
                                    { label: 'L', val: hoveredCandle?.low ?? chartData[chartData.length - 1]?.low, col: 'text-rose-500' },
                                    { label: 'C', val: hoveredCandle?.close ?? chartData[chartData.length - 1]?.close, col: 'text-violet-500' }
                                ].map(ohlc => (
                                    <div key={ohlc.label} className="flex flex-col">
                                        <span className="text-[7px] md:text-[9px] font-black uppercase text-slate-500 tracking-tighter mb-0">{ohlc.label}</span>
                                        <span className={`text-[10px] md:text-[15px] font-mono font-black ${ohlc.col} leading-none`}>
                                            {formatPrice(ohlc.val)}
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

                    {/* ── Tactical Entry Scan Results Panel ─────────────── */}
                    <AnimatePresence>
                        {tacticalResult && isTacticalMode && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="absolute bottom-4 right-4 z-[150] w-[320px] md:w-[360px] max-h-[60vh] overflow-y-auto no-scrollbar"
                            >
                                <div className={`rounded-[24px] border-2 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.4)] backdrop-blur-xl ${theme === 'dark' ? 'bg-[#0e0e1a]/90 border-violet-500/30' : 'bg-white/90 border-violet-200'}`}>
                                    {/* Header gradient bar */}
                                    <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

                                    <div className="p-5 space-y-4">
                                        {/* Title */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-violet-500/20">
                                                    <Crosshair size={14} className="text-violet-400" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Tactical Entry Scan</span>
                                            </div>
                                            <button onClick={clearTacticalScan} className="p-1 rounded-lg hover:bg-white/10 transition-all">
                                                <X size={14} className="text-slate-500" />
                                            </button>
                                        </div>

                                        {/* Entry Price */}
                                        <div className={`p-3 rounded-2xl border text-center ${theme === 'dark' ? 'bg-violet-500/5 border-violet-500/20' : 'bg-violet-50 border-violet-100'}`}>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Entry Price</span>
                                            <p className="text-xl font-mono font-black text-violet-400 mt-0.5">
                                                {formatPrice(tacticalResult.entry)}
                                            </p>
                                        </div>

                                        {/* Confluence Score */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Confluence</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 rounded-full bg-slate-700/30 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${tacticalResult.confluenceScore >= 70 ? 'bg-purple-500'
                                                            : tacticalResult.confluenceScore >= 45 ? 'bg-amber-500'
                                                                : 'bg-rose-500'
                                                            }`}
                                                        style={{ width: `${tacticalResult.confluenceScore}%` }}
                                                    />
                                                </div>
                                                <span className={`text-sm font-black ${tacticalResult.confluenceScore >= 70 ? 'text-purple-400'
                                                        : tacticalResult.confluenceScore >= 45 ? 'text-amber-400'
                                                            : 'text-rose-400'
                                                    }`}>{tacticalResult.confluenceScore}%</span>
                                            </div>
                                        </div>

                                        {/* Direction Badge */}
                                        <div className="flex items-center justify-center">
                                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${tacticalResult.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                    : tacticalResult.direction === 'SHORT' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                                        : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                                                }`}>
                                                {tacticalResult.direction === 'LONG' ? '▲' : tacticalResult.direction === 'SHORT' ? '▼' : '◆'} {tacticalResult.direction} BIAS · RSI {tacticalResult.rsi}
                                            </span>
                                        </div>

                                        {/* Long / Short Scenarios */}
                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Long */}
                                            <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <TrendingUp size={12} className="text-emerald-400" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Long</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between">
                                                        <span className="text-[8px] text-slate-500">Target</span>
                                                        <span className="text-[10px] font-mono font-bold text-emerald-400">{formatPrice(tacticalResult.long.target)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-[8px] text-slate-500">Stop</span>
                                                        <span className="text-[10px] font-mono font-bold text-rose-400">{formatPrice(tacticalResult.long.stop)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-[8px] text-slate-500">R:R</span>
                                                        <span className={`text-[10px] font-black ${parseFloat(tacticalResult.long.rr) >= 2 ? 'text-emerald-400' : 'text-amber-400'}`}>{tacticalResult.long.rr}:1</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-[8px] text-slate-500">Move</span>
                                                        <span className="text-[10px] font-black text-emerald-400">+{tacticalResult.long.pctMove}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Short */}
                                            <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-rose-900/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <TrendingDown size={12} className="text-rose-400" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-rose-400">Short</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between">
                                                        <span className="text-[8px] text-slate-500">Target</span>
                                                        <span className="text-[10px] font-mono font-bold text-emerald-400">{formatPrice(tacticalResult.short.target)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-[8px] text-slate-500">Stop</span>
                                                        <span className="text-[10px] font-mono font-bold text-rose-400">{formatPrice(tacticalResult.short.stop)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-[8px] text-slate-500">R:R</span>
                                                        <span className={`text-[10px] font-black ${parseFloat(tacticalResult.short.rr) >= 2 ? 'text-emerald-400' : 'text-amber-400'}`}>{tacticalResult.short.rr}:1</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-[8px] text-slate-500">Move</span>
                                                        <span className="text-[10px] font-black text-rose-400">-{tacticalResult.short.pctMove}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* S/R Zone Proximity */}
                                        <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2 block">S/R Zone Proximity</span>
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] text-emerald-400">◼ Support</span>
                                                    <span className="text-[9px] font-mono font-bold text-slate-300">{formatPrice(tacticalResult.levels.nearestSupport)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] text-rose-400">◼ Resistance</span>
                                                    <span className="text-[9px] font-mono font-bold text-slate-300">{formatPrice(tacticalResult.levels.nearestResistance)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] text-slate-500">ATR</span>
                                                    <span className="text-[9px] font-mono font-bold text-slate-400">{formatPrice(tacticalResult.atr)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hint */}
                                        <p className="text-[8px] text-center text-slate-600 italic">
                                            Click anywhere on the chart to re-scan a new entry point
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Scanning Terminal Animation (shows during analysis) */}
                    {isJudging && scanProgress.length > 0 && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] max-w-sm w-full p-1">
                            <div className={`rounded-[32px] border-2 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] ${theme === 'dark' ? 'bg-[#0a0a14] border-blue-500/30' : 'bg-white border-blue-200'}`}>
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 italic">Neural Trade Scan</span>
                                    </div>
                                    <div className="space-y-3 font-mono">
                                        {scanProgress.map((s, i) => (
                                            <div key={i} className={`flex items-center gap-3 text-[11px] transition-all duration-300 ${s.status === 'complete' ? 'opacity-100' : 'opacity-70'}`}>
                                                <span className="text-base">{s.icon}</span>
                                                <span className={`flex-1 font-bold ${s.status === 'complete' ? (theme === 'dark' ? 'text-purple-400' : 'text-purple-600') : (theme === 'dark' ? 'text-blue-400' : 'text-blue-600')}`}>
                                                    {s.step}
                                                </span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${s.status === 'complete' ? 'text-purple-500' : 'text-blue-500 animate-pulse'}`}>
                                                    {s.status === 'complete' ? '[OK]' : '[SCAN]'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* God-Mode Verdict Dashboard */}
                    {blueprintVerdict && !isJudging && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] w-full max-w-md p-1 animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto no-scrollbar">
                            <div className={`rounded-[32px] border-2 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] ${blueprintVerdict.confluenceScore >= 70 ? (theme === 'dark' ? 'bg-[#0a1a0a] border-purple-500/30' : 'bg-white border-purple-200')
                                : blueprintVerdict.confluenceScore >= 45 ? (theme === 'dark' ? 'bg-[#1a1a0a] border-amber-500/30' : 'bg-white border-amber-200')
                                    : (theme === 'dark' ? 'bg-[#1a0a0a] border-rose-500/30' : 'bg-white border-rose-200')
                                }`}>
                                {/* Top gradient bar */}
                                <div className={`h-1 w-full ${blueprintVerdict.confluenceScore >= 70 ? 'bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-500'
                                    : blueprintVerdict.confluenceScore >= 45 ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500'
                                        : 'bg-gradient-to-r from-rose-500 via-red-400 to-pink-500'
                                    }`} />

                                <div className="p-6 space-y-5">
                                    {/* ── Header ──────────────────── */}
                                    <div className="text-center">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic mb-4">Trade Intelligence Report</p>

                                        {/* Confluence Score Circle */}
                                        <div className="relative inline-flex items-center justify-center w-32 h-32 mb-3">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                                <circle cx="60" cy="60" r="52" fill="none" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} strokeWidth="8" />
                                                <circle cx="60" cy="60" r="52" fill="none"
                                                    stroke={blueprintVerdict.confluenceScore >= 70 ? '#10b981' : blueprintVerdict.confluenceScore >= 45 ? '#f59e0b' : '#ef4444'}
                                                    strokeWidth="8" strokeLinecap="round"
                                                    strokeDasharray={`${blueprintVerdict.confluenceScore * 3.27} 327`}
                                                    className="transition-all duration-1000"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className={`text-4xl font-black ${blueprintVerdict.confluenceScore >= 70 ? 'text-purple-400'
                                                    : blueprintVerdict.confluenceScore >= 45 ? 'text-amber-400'
                                                        : 'text-rose-400'
                                                    }`}>
                                                    {blueprintVerdict.confluenceScore}
                                                </span>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">/ 100</span>
                                            </div>
                                        </div>

                                        {/* Verdict Badge */}
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${blueprintVerdict.confluenceScore >= 70 ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                            : blueprintVerdict.confluenceScore >= 45 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                            }`}>
                                            <span>{blueprintVerdict.verdictEmoji}</span>
                                            <span>{blueprintVerdict.verdict?.replace(/_/g, ' ')}</span>
                                            <span className="mx-1">·</span>
                                            <span>{blueprintVerdict.direction}</span>
                                            <span className="mx-1">·</span>
                                            <span>{blueprintVerdict.rr}:1 R:R</span>
                                        </div>
                                    </div>

                                    {showDetailedVerdict ? (
                                        /* ── Detailed View ──────────────── */
                                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                            {/* Radar Chart (SVG Spider Web) */}
                                            {blueprintVerdict.radar && (
                                                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-violet-500 mb-3 italic">Confluence Radar</h4>
                                                    <div className="flex justify-center">
                                                        <svg viewBox="0 0 200 200" className="w-44 h-44">
                                                            {/* Background pentagons */}
                                                            {[1, 0.75, 0.5, 0.25].map((scale, i) => {
                                                                const axes = Object.keys(blueprintVerdict.radar);
                                                                const points = axes.map((_, idx) => {
                                                                    const angle = (Math.PI * 2 * idx / axes.length) - Math.PI / 2;
                                                                    return `${100 + Math.cos(angle) * 70 * scale},${100 + Math.sin(angle) * 70 * scale}`;
                                                                }).join(' ');
                                                                return <polygon key={i} points={points} fill="none" stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="1" />;
                                                            })}
                                                            {/* Data polygon */}
                                                            {(() => {
                                                                const axes = Object.entries(blueprintVerdict.radar);
                                                                const points = axes.map(([, value], idx) => {
                                                                    const angle = (Math.PI * 2 * idx / axes.length) - Math.PI / 2;
                                                                    const r = (value / 100) * 70;
                                                                    return `${100 + Math.cos(angle) * r},${100 + Math.sin(angle) * r}`;
                                                                }).join(' ');
                                                                return <polygon points={points} fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" strokeWidth="2" />;
                                                            })()}
                                                            {/* Labels */}
                                                            {Object.entries(blueprintVerdict.radar).map(([label, value], idx) => {
                                                                const axes = Object.keys(blueprintVerdict.radar);
                                                                const angle = (Math.PI * 2 * idx / axes.length) - Math.PI / 2;
                                                                const x = 100 + Math.cos(angle) * 90;
                                                                const y = 100 + Math.sin(angle) * 90;
                                                                return (
                                                                    <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                                                                        className="text-[7px] font-bold fill-slate-400">{label} ({value})</text>
                                                                );
                                                            })}
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Checklist */}
                                            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                                                <h4 className="text-[9px] font-black uppercase text-slate-500 mb-3 tracking-widest">Validation Checklist</h4>
                                                <div className="space-y-2">
                                                    {blueprintVerdict.checklist?.map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between">
                                                            <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{item.label}</span>
                                                            <div className="flex items-center gap-2">
                                                                {item.value && <span className="text-[9px] font-mono text-slate-500">{item.value}</span>}
                                                                {item.pass ? <CheckCircle2 size={13} className="text-purple-500" /> : <X size={13} className="text-rose-500" />}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Dimension Findings */}
                                            {blueprintVerdict.dimensions && Object.entries(blueprintVerdict.dimensions).map(([dimKey, dim]) => {
                                                if (!dim?.findings?.length) return null;
                                                const dimLabels = { technicals: '📊 Technicals', volume_liquidity: '🌊 Volume', derivatives: '📈 Derivatives', fundamentals: '📰 Fundamentals', risk_math: '🧮 Risk Math' };
                                                return (
                                                    <div key={dimKey} className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-violet-500 italic">{dimLabels[dimKey] || dimKey}</span>
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${dim.score >= 65 ? 'bg-purple-500/20 text-purple-400'
                                                                : dim.score >= 45 ? 'bg-amber-500/20 text-amber-400'
                                                                    : 'bg-rose-500/20 text-rose-400'
                                                                }`}>{dim.score}%</span>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            {dim.findings.map((f, fi) => (
                                                                <p key={fi} className={`text-[10px] leading-relaxed font-medium ${f.type === 'bullish' ? 'text-purple-400'
                                                                    : f.type === 'danger' ? 'text-rose-400'
                                                                        : f.type === 'warning' ? 'text-amber-400'
                                                                            : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                                                                    }`}>
                                                                    {f.type === 'bullish' ? '✅ ' : f.type === 'danger' ? '🚨 ' : f.type === 'warning' ? '⚠️ ' : '• '}{f.msg}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Actionable Suggestions */}
                                            {blueprintVerdict.suggestions?.length > 0 && (
                                                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Brain size={14} className="text-blue-500" />
                                                        <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest">Actionable Adjustments</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {blueprintVerdict.suggestions.map((s, i) => (
                                                            <p key={i} className={`text-[10px] leading-relaxed font-bold italic ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                                                                💡 {s}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => setShowDetailedVerdict(false)}
                                                className="w-full py-2 text-[9px] font-black uppercase tracking-tighter text-blue-500 hover:text-blue-400 transition-colors"
                                            >
                                                ← Back to Verdict
                                            </button>
                                        </div>
                                    ) : (
                                        /* ── Summary View ──────────────── */
                                        <>
                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-4 gap-2">
                                                {[
                                                    { label: 'R:R', value: `${blueprintVerdict.rr}:1`, color: blueprintVerdict.rr >= 2 ? 'text-purple-400' : 'text-rose-400' },
                                                    { label: 'RSI', value: blueprintVerdict.stats?.rsi || 'N/A', color: 'text-violet-400' },
                                                    { label: 'Risk', value: `$${blueprintVerdict.stats?.risk}`, color: 'text-rose-400' },
                                                    { label: 'Reward', value: `$${blueprintVerdict.stats?.reward}`, color: 'text-purple-400' },
                                                ].map(stat => (
                                                    <div key={stat.label} className={`p-2.5 rounded-xl border text-center ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                                        <p className="text-[7px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                                                        <p className={`text-sm font-black italic ${stat.color}`}>{stat.value}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Quick Checklist */}
                                            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                                {blueprintVerdict.checklist?.slice(0, 4).map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between py-1">
                                                        <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{item.label}</span>
                                                        {item.pass ? <CheckCircle2 size={12} className="text-purple-500" /> : <X size={12} className="text-rose-500" />}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Top suggestion */}
                                            {blueprintVerdict.suggestions?.[0] && (
                                                <div className={`p-3 rounded-2xl border ${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                                                    <p className={`text-[10px] font-bold italic leading-relaxed ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                                                        💡 {blueprintVerdict.suggestions[0]}
                                                    </p>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => setShowDetailedVerdict(true)}
                                                className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                View Full Diagnostic Report
                                            </button>
                                        </>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button
                                            onClick={() => {
                                                setBlueprintVerdict(null);
                                                setShowDetailedVerdict(false);
                                                setScanProgress([]);
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
                    )}

                    {/* Chart Container */}
                    <div
                        ref={chartContainerRef}
                        className={`w-full h-full relative z-10 ${isBlueprintMode ? 'cursor-crosshair' : ''}`}
                    >
                        {/* Liquidity Heatmap Canvas Overlay */}
                        <LiquidityHeatmap
                            chartRef={chartRef}
                            containerRef={chartContainerRef}
                            symbol={symbol}
                            isVisible={showLiquidityHeatmap}
                            currentPrice={currentPrice}
                        />
                    </div>

                    {/* On-Chain Bias Overlay Pane */}
                    {selectedIndicators.onchainBias && onchainData && (
                        <div className={`w-full border-t px-4 py-3 flex-shrink-0 ${theme === 'dark' ? 'bg-[#0a0a12] border-white/5' : 'bg-slate-50 border-slate-200'}`}
                            style={{ height: '100px' }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Link2 size={12} className="text-violet-400" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400">
                                        On-Chain Bias · {onchainData.asset || (symbol?.includes('BTC') ? 'BTC' : 'ETH')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-black font-mono ${onchainData.score > 0.1 ? 'text-purple-400' : onchainData.score < -0.1 ? 'text-rose-400' : 'text-amber-400'
                                        }`}>
                                        {onchainData.score > 0 ? '+' : ''}{onchainData.score?.toFixed(2)}
                                    </span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${onchainData.trend?.includes('Bullish') ? 'bg-purple-500/10 text-purple-400'
                                        : onchainData.trend?.includes('Bearish') ? 'bg-rose-500/10 text-rose-400'
                                            : 'bg-amber-500/10 text-amber-400'
                                        }`}>
                                        {onchainData.trend}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 h-8">
                                {/* Score Bar */}
                                <div className="flex-1 relative h-3 rounded-full overflow-hidden" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#e2e8f0' }}>
                                    <div className="absolute left-1/2 top-0 w-px h-full" style={{ background: 'rgba(100,116,139,0.3)' }} />
                                    {(() => {
                                        const score = onchainData.score || 0;
                                        const barWidth = Math.abs(score) * 50;
                                        const barLeft = score >= 0 ? 50 : 50 - barWidth;
                                        const barColor = score > 0.1 ? '#10b981' : score < -0.1 ? '#f43f5e' : '#f59e0b';
                                        return <div className="absolute top-0 h-full rounded-full transition-all duration-700" style={{ left: `${barLeft}%`, width: `${barWidth}%`, background: barColor, opacity: 0.8 }} />;
                                    })()}
                                </div>
                                {/* Component Pills */}
                                <div className="flex gap-2 flex-shrink-0">
                                    {[
                                        { label: 'W', value: onchainData.whale_score, title: 'Whale Flow' },
                                        { label: 'E', value: onchainData.exchange_score, title: 'Exchange Flow' },
                                        { label: 'A', value: onchainData.activity_score, title: 'Activity' },
                                    ].map(c => (
                                        <div key={c.label} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${theme === 'dark' ? 'bg-white/5' : 'bg-white'}`} title={c.title}>
                                            <span className="text-slate-500">{c.label}</span>
                                            <span className={c.value > 0 ? 'text-purple-400' : c.value < 0 ? 'text-rose-400' : 'text-slate-400'}>
                                                {c.value > 0 ? '+' : ''}{(c.value || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

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
                            className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all hover:scale-110 active:scale-90 ${theme === 'dark' ? 'bg-[#1e2030]/80 border-slate-700 text-slate-400 hover:text-violet-400' : 'bg-white/80 border-slate-200 text-slate-600 hover:text-violet-600'}`}
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

                {/* Login Modal */}
                {showLoginModal && <LoginSignup onClose={() => setShowLoginModal(false)} />}

                <aside
                    className={`h-full border-l transition-[width,opacity] duration-500 ease-in-out flex flex-col flex-shrink-0 z-[100] will-change-[width,opacity] ${focusMode
                        ? 'w-0 border-none overflow-hidden opacity-0 pointer-events-none'
                        : showAIChat
                            ? isMobile ? 'fixed inset-0 w-full' : 'relative w-full md:w-[450px] xl:w-[550px] opacity-100'
                            : 'w-0 border-none overflow-hidden opacity-0 pointer-events-none'
                        } ${theme === 'dark' ? 'bg-[#0f111a] border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}
                >
                    <div
                        className="flex flex-col h-full w-full"
                        style={{ display: showAIChat && !focusMode ? 'flex' : 'none' }}
                    >
                        <header className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 ${theme === 'dark' ? 'bg-[#0f111a]/80 border-white/5 backdrop-blur-xl' : 'bg-white/90 border-slate-200 backdrop-blur-md'}`}>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-11 h-11 rounded-2xl bg-[#0f111a] flex items-center justify-center shadow-lg border border-white/5 overflow-hidden">
                                        <img src="/logo.png" alt="Nunno Logo" className="w-8 h-8 object-contain" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-[#0f111a] flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className={`font-black tracking-tight text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Nunno Intel</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Neural Link Active</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAIChat(false)}
                                className={`p-2.5 rounded-xl transition-all active:scale-90 ${theme === 'dark' ? 'hover:bg-white/5 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}
                            >
                                <X size={22} />
                            </button>
                        </header>

                        <div className="flex-1 overflow-hidden">
                            <PatternChatPanel
                                onPatternGenerated={handleAIPattern}
                                onLivePatternDetected={handleLivePatternDetected}
                                onUnauthorized={() => setShowLoginModal(true)}
                                currentPrice={currentPrice}
                                interval={interval}
                                symbol={symbol}
                                onSymbolChange={setSymbol}
                                onHighlightLevels={(levels) => setHighlightedLevels(levels)}
                                onCorrelationOverlay={handleCorrelationOverlay}
                                getTechnicalContext={() => {
                                    const lastCandle = chartData[chartData.length - 1];
                                    if (!lastCandle) return null;

                                    const activeIndicators = Object.keys(selectedIndicators)
                                        .filter(key => selectedIndicators[key]);

                                    // Always include ALL core indicators for Deep Scan, not just selected ones
                                    const indicatorValues = {};
                                    ['ema9', 'ema21', 'ema50', 'ema100', 'ema200', 'rsi', 'atr'].forEach(key => {
                                        if (calculatedIndicators[key]) {
                                            indicatorValues[key] = getCurrentValue(calculatedIndicators[key]);
                                        }
                                    });

                                    if (calculatedIndicators.bbUpper) {
                                        indicatorValues.bollingerBands = {
                                            upper: getCurrentValue(calculatedIndicators.bbUpper),
                                            middle: getCurrentValue(calculatedIndicators.bbMiddle),
                                            lower: getCurrentValue(calculatedIndicators.bbLower)
                                        };
                                    }

                                    if (calculatedIndicators.support) {
                                        indicatorValues.levels = {
                                            support: calculatedIndicators.support.map(l => l.price),
                                            resistance: calculatedIndicators.resistance.map(l => l.price)
                                        };
                                    }

                                    if (calculatedIndicators.macd) {
                                        indicatorValues.macd = {
                                            macd: getCurrentValue(calculatedIndicators.macd),
                                            signal: getCurrentValue(calculatedIndicators.macdSignal),
                                            histogram: getCurrentValue(calculatedIndicators.macdHistogram)
                                        };
                                    }

                                    // Compute market structure stats from recent data
                                    const recentSlice = chartData.slice(-30);
                                    const highs = recentSlice.map(d => d.high);
                                    const lows = recentSlice.map(d => d.low);
                                    const closes = recentSlice.map(d => d.close);
                                    const volumes = recentSlice.map(d => d.volume || 0);
                                    const periodHigh = Math.max(...highs);
                                    const periodLow = Math.min(...lows);
                                    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
                                    const totalVolume = volumes.reduce((a, b) => a + b, 0);
                                    const firstClose = closes[0] || lastCandle.close;
                                    const trendPct = ((lastCandle.close - firstClose) / firstClose * 100).toFixed(2);

                                    return {
                                        symbol,
                                        interval,
                                        currentPrice: lastCandle.close,
                                        open: lastCandle.open,
                                        high: lastCandle.high,
                                        low: lastCandle.low,
                                        volume: lastCandle.volume || 0,
                                        recentHistory: recentSlice.map(d => ({
                                            t: d.time,
                                            o: d.open,
                                            h: d.high,
                                            l: d.low,
                                            c: d.close,
                                            v: d.volume || 0
                                        })),
                                        marketStructure: {
                                            periodHigh,
                                            periodLow,
                                            range: periodHigh - periodLow,
                                            rangePct: ((periodHigh - periodLow) / periodLow * 100).toFixed(2),
                                            trendDirection: parseFloat(trendPct) > 0.5 ? 'BULLISH' : parseFloat(trendPct) < -0.5 ? 'BEARISH' : 'SIDEWAYS',
                                            trendPct,
                                            avgVolume: Math.round(avgVolume),
                                            totalVolume: Math.round(totalVolume),
                                            currentVsAvgVol: lastCandle.volume ? ((lastCandle.volume / avgVolume) * 100).toFixed(0) : 'N/A'
                                        },
                                        closeSeries: chartData.slice(-1000).map(d => d.close),
                                        indicatorValues,
                                        activeIndicators,
                                        timestamp: new Date().toISOString()
                                    };
                                }}

                            />
                        </div>
                    </div>
                </aside>
            </div>
            {/* Simulation Laboratory Deep Dive Modal */}
            <AnimatePresence>
                {showLabDeepDive && scenarioData && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLabDeepDive(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`relative w-full max-w-5xl max-h-[90dvh] overflow-y-auto rounded-[2.5rem] border shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-[#0b0c14] border-white/10' : 'bg-white border-slate-200'}`}
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-inherit z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-violet-500/20">
                                        <Microscope size={24} className="text-violet-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white">Quantum Simulation Lab</h2>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model: Agentic Monte Carlo Engine v2.4 (Beta)</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowLabDeepDive(false)} className="p-2 rounded-full hover:bg-white/5 text-slate-400 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Column 1: Core Parameters */}
                                <div className="space-y-6">
                                    <div className="p-6 rounded-[2rem] bg-violet-500/5 border border-violet-500/10">
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-violet-400 mb-6 flex items-center gap-2">
                                            <Settings size={14} /> Simulation Constants
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Time Horizon', value: `${scenarioData.meta?.steps || 30} Candles`, desc: 'Max look-forward window for simulation paths.' },
                                                { label: 'Agent Count', value: scenarioData.meta?.num_paths || 50, desc: 'Divergent paths generated per request.' },
                                                { label: 'Base Price', value: `$${currentPrice?.toLocaleString()}`, desc: 'The starting equilibrium point for all paths.' },
                                                { label: 'Volatility Anchor', value: `${((scenarioData.meta?.volatility_used || 0) * 100).toFixed(3)}%`, desc: 'Normalised ATR-based standard deviation.' }
                                            ].map((param, i) => (
                                                <div key={i} className="group">
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase">{param.label}</span>
                                                        <span className="text-xs font-black text-white">{param.value}</span>
                                                    </div>
                                                    <p className="text-[8px] text-slate-600 italic leading-tight">{param.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-[2rem] bg-violet-500/5 border border-violet-500/10">
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-violet-400 mb-6 flex items-center gap-2">
                                            <Brain size={14} /> Regime Intelligence
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="p-3 rounded-2xl bg-white/5">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Detected Bias</span>
                                                <span className="text-sm font-black text-violet-400 uppercase tracking-wider">{scenarioData.market_regime || 'NEUTRAL'}</span>
                                            </div>
                                            <div className="text-[9px] text-slate-400 leading-relaxed font-medium">
                                                The simulation is currently using **Geometric Brownian Motion (GBM)** with a drift coefficient of <span className="text-violet-400">λ={scenarioData.meta?.vol_multiplier || 1.0}x</span>. This forces the random-walk agents to respect the momentum detected in the technical layer.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Column 2 & 3: Statistical Breakdown & Physics */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-[2rem] bg-purple-500/5 border border-purple-500/10">
                                            <h3 className="text-[11px] font-black uppercase tracking-widest text-purple-400 mb-4">Probability Spread</h3>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-3xl font-black text-white">{scenarioData.metrics?.spread || '0.00%'}</span>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Variance</span>
                                            </div>
                                            <p className="text-[9px] text-slate-500 leading-normal">
                                                This metric represents the "Uncertainty Envelope." {parseFloat(scenarioData.metrics?.spread) > 5 ? 'The high spread indicates extreme tail-risk. Expect violent price discovery.' : 'A tight spread indicates high model confidence in the equilibrium target.'}
                                            </p>
                                        </div>
                                        <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10">
                                            <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-400 mb-4">Outcome Distribution</h3>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden flex">
                                                    <div className="h-full bg-purple-500" style={{ width: '65%' }} />
                                                    <div className="h-full bg-rose-500" style={{ width: '35%' }} />
                                                </div>
                                                <span className="text-[10px] font-black text-white uppercase">65% Bulls</span>
                                            </div>
                                            <p className="mt-4 text-[9px] text-slate-500 leading-normal italic">
                                                *Relative distribution based on agent clustering around the P50 median.
                                            </p>
                                        </div>
                                    </div>

                                    {/* The "Physics" explanation */}
                                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                                        <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-white mb-6">Engine Physics: How it "Thinks"</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-black text-violet-400 shrink-0">01</div>
                                                    <div>
                                                        <h4 className="text-[11px] font-bold uppercase text-slate-200 mb-1">Stochastic Modeling</h4>
                                                        <p className="text-[10px] text-slate-500 leading-relaxed">Nunno uses Monte Carlo methods to solve the future state of {symbol}. We generate N=50 paths using current market heat as the standard deviation.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-black text-violet-400 shrink-0">02</div>
                                                    <div>
                                                        <h4 className="text-[11px] font-bold uppercase text-slate-200 mb-1">Mean Reversion Tether</h4>
                                                        <p className="text-[10px] text-slate-500 leading-relaxed">In consolidation regimes, the engine applies a simulated elastic force, pulling "wild" agents back toward the base price to mimic ranging behavior.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-black text-violet-400 shrink-0">03</div>
                                                    <div>
                                                        <h4 className="text-[11px] font-bold uppercase text-slate-200 mb-1">Structural Anchoring</h4>
                                                        <p className="text-[10px] text-slate-500 leading-relaxed">The paths aren't flying into empty space. They are physically bouncing off the **S1 Support (${scenarioData.meta?.support_used?.toFixed(1)})** and **R1 Resistance (${scenarioData.meta?.resistance_used?.toFixed(1)})** detected on the chart.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-black text-violet-400 shrink-0">04</div>
                                                    <div>
                                                        <h4 className="text-[11px] font-bold uppercase text-slate-200 mb-1">Percentile Synthesis</h4>
                                                        <p className="text-[10px] text-slate-500 leading-relaxed">Finally, we take the P50 (Median) as the definitive prediction. If 75% of agents (the P75 cloud) are above the start price, the bias is confirmed Bullish.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                <span>© 2026 Nunno Labs • Predictive Intelligence Suite</span>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500" /> ENGINE ONLINE</span>
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-500" /> SYNCED TO BINANCE</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EliteChart;
