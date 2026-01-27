import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, BarChart, Bar, ComposedChart, ReferenceLine } from 'recharts';
import { TrendingUp, Settings, PlayCircle, StopCircle, Code, RefreshCw, BarChart3, Minus, Plus, Info, ChevronDown, Eye, EyeOff, Activity, Pause, RotateCcw, ChevronRight, ChevronLeft, Gauge, Volume2, VolumeX, LineChart as LineChartIcon, BarChart as BarChartIcon, Layers, X, Sparkles } from 'lucide-react';
import PatternChatPanel from './PatternChatPanel';
import PatternInfoCard from './PatternInfoCard';
import {
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateSupportResistance,
  calculateATR,
  getCurrentValue
} from '../utils/technicalIndicators';

const CryptoChartWebSocket = () => {
  const [chartData, setChartData] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1m');
  const [indicators, setIndicators] = useState([]);

  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [priceChange, setPriceChange] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [chartType, setChartType] = useState('line'); // 'line' or 'area'
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  // Technical Indicators State
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
  const [showIndicatorPanel, setShowIndicatorPanel] = useState(false);
  const [calculatedIndicators, setCalculatedIndicators] = useState({});

  // Trading Scenario Simulation State
  const [showScenarioSimulator, setShowScenarioSimulator] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null); // 'long-support', 'short-resistance', etc.
  const [scenarioData, setScenarioData] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [activeTab, setActiveTab] = useState('indicators'); // 'indicators', 'simulator'

  // Animation state for scenario playback
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(300); // ms per step
  const animationIntervalRef = useRef(null);

  // Layout & UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 5x, 10x
  const [currentSimulationTime, setCurrentSimulationTime] = useState(null);
  const [hoveredData, setHoveredData] = useState(null); // For OHLC display
  const [showVolume, setShowVolume] = useState(true);

  // Pattern Recognition State
  const [patternData, setPatternData] = useState(null);
  const [showPattern, setShowPattern] = useState(false);
  const [showPatternInfo, setShowPatternInfo] = useState(false);

  const wsRef = useRef(null);
  const dataBufferRef = useRef([]);
  const reconnectTimeoutRef = useRef(null);
  const initialLoadRef = useRef(true);

  // --- Chart UX helpers (formatting, ticks, crosshair) ---
  const formatUSD = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '';
    const n = Number(value);
    // Match request: $93,000 (not $93K)
    // Use more decimals for sub-$1 assets to avoid rounding to $0.00.
    if (Math.abs(n) < 1) return `$${n.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}`;
    return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatXAxisLabel = (candle) => {
    if (!candle) return '';
    const ts = candle.timestamp || candle.t || candle.T;
    const d = ts ? new Date(Number(ts)) : null;
    if (!d || Number.isNaN(d.getTime())) return candle.time || '';

    // For daily+ intervals show date, otherwise show time (HH:MM)
    const isDaily = interval === '1d';
    if (isDaily) {
      return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
    }
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const getXAxisInterval = (dataLen) => {
    // Show fewer, more strategic times to reduce clutter.
    if (!dataLen || dataLen <= 0) return 0;
    // Aim for ~6-8 labels across.
    const targetTicks = 7;
    return Math.max(0, Math.floor(dataLen / targetTicks));
  };

  const CrosshairCursor = (props) => {
    const { points, width, height, payload } = props || {};
    // Only show crosshair when hovering over actual data points/indicator lines
    if (!points || !points[0]) return null;

    // Check if payload has valid indicator data
    if (payload && payload.length > 0) {
      const hasValidData = payload.some(item =>
        item &&
        item.payload &&
        item.value !== undefined &&
        item.value !== null &&
        !Number.isNaN(Number(item.value))
      );
      if (!hasValidData) return null;
    } else {
      // No payload means not hovering over data
      return null;
    }

    const x = points[0].x;
    const y = points[0].y;
    return (
      <g>
        {/* Vertical */}
        <line x1={x} y1={0} x2={x} y2={height} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" opacity={0.8} />
        {/* Horizontal */}
        <line x1={0} y1={y} x2={width} y2={y} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" opacity={0.8} />
      </g>
    );
  };

  const SRLabel = ({ type, level }) => {
    const color = type === 'support' ? '#166534' : '#991b1b';
    const title = type === 'support'
      ? `Support: ${formatUSD(level.price)} — likely demand zone where buyers previously stepped in.`
      : `Resistance: ${formatUSD(level.price)} — likely supply zone where sellers previously defended.`;

    // Keep it small: this is just a hover-triggered “info hint” directly on chart labels.
    return (
      <text fill={color} fontSize={12} fontWeight={800}>
        <title>{title}</title>
        {type === 'support' ? `Support ${formatUSD(level.price)}` : `Resistance ${formatUSD(level.price)}`}
      </text>
    );
  };

  const INDICATOR_INFO = {
    close: 'Last traded/closed price for each candle.',
    ema9: 'EMA 9: fast trend line reacting quickly to price changes.',
    ema21: 'EMA 21: medium trend line often used for pullbacks.',
    ema50: 'EMA 50: broader trend filter / dynamic support-resistance.',
    ema100: 'EMA 100: long trend filter.',
    ema200: 'EMA 200: major trend line; often watched as key regime level.',
    bbUpper: 'Bollinger Upper: 2σ above the 20-period average (overextension zone).',
    bbMiddle: 'Bollinger Middle: 20-period moving average (mean).',
    bbLower: 'Bollinger Lower: 2σ below the 20-period average (overextension zone).'
  };

  const CustomTooltip = ({ active, payload }) => {
    // Only show tooltip when hovering directly over data points/indicator lines
    // Filter out empty payloads or payloads without valid data
    if (!active || !payload || payload.length === 0) {
      setHoveredData(null);
      return null;
    }

    // Check if we have at least one valid payload item with actual data
    const validPayload = payload.filter(item =>
      item &&
      item.payload &&
      item.value !== undefined &&
      item.value !== null &&
      !Number.isNaN(Number(item.value))
    );

    // Only show tooltip if we're hovering over an actual indicator line or data point
    if (validPayload.length === 0) {
      setHoveredData(null);
      return null;
    }

    const p0 = validPayload[0]?.payload || {};
    const ts = p0.timestamp || p0.t || p0.T;
    const timeLabel = ts ? new Date(Number(ts)).toLocaleString() : (p0.time || '');
    const price = p0.close;

    // Update hovered data for OHLC display in top-left
    if (p0.open !== undefined && p0.high !== undefined && p0.low !== undefined && p0.close !== undefined) {
      setHoveredData({
        open: p0.open,
        high: p0.high,
        low: p0.low,
        close: p0.close,
        volume: p0.volume,
        time: timeLabel
      });
    } else {
      setHoveredData(null);
    }

    // Key level "info cards": show nearest S/R around current hover price
    // Only show if we're hovering over a data point (not just roaming)
    const supports = selectedIndicators.supportResistance ? (calculatedIndicators.support || []) : [];
    const resistances = selectedIndicators.supportResistance ? (calculatedIndicators.resistance || []) : [];
    const nearestSupport = supports.length
      ? supports
        .filter(l => l?.price !== undefined && l.price <= price)
        .sort((a, b) => b.price - a.price)[0]
      : null;
    const nearestResistance = resistances.length
      ? resistances
        .filter(l => l?.price !== undefined && l.price >= price)
        .sort((a, b) => a.price - b.price)[0]
      : null;

    // Only show rows for indicators that are actually in the payload (i.e., hovered over)
    const rows = validPayload
      .filter(item => item && item.name && item.value !== undefined && item.value !== null)
      .map(item => ({
        key: item.dataKey || item.name,
        name: item.name,
        value: item.value,
        color: item.color
      }));

    return (
      <div style={{
        background: 'rgba(255,255,255,0.97)',
        border: '1px solid #cbd5e1',
        borderRadius: 14,
        padding: '12px 12px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
        maxWidth: 320
      }}>
        <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>{timeLabel}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{formatUSD(price)}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Price</div>
        </div>

        {(nearestSupport || nearestResistance) && (
          <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
            {nearestSupport && (
              <div style={{ border: '1px solid rgba(34,197,94,0.35)', background: 'rgba(34,197,94,0.08)', borderRadius: 12, padding: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#166534' }}>Support {formatUSD(nearestSupport.price)}</div>
                <div style={{ fontSize: 12, color: '#334155', marginTop: 3 }}>
                  Likely demand zone where buyers previously stepped in{nearestSupport.strength ? ` (${nearestSupport.strength}).` : '.'}
                </div>
              </div>
            )}
            {nearestResistance && (
              <div style={{ border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.07)', borderRadius: 12, padding: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#991b1b' }}>Resistance {formatUSD(nearestResistance.price)}</div>
                <div style={{ fontSize: 12, color: '#334155', marginTop: 3 }}>
                  Likely supply zone where sellers previously defended{nearestResistance.strength ? ` (${nearestResistance.strength}).` : '.'}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gap: 8 }}>
          {rows.map(r => {
            const isCustom = String(r.key).startsWith('indicator_');
            const desc = isCustom ? 'Custom indicator series.' : (INDICATOR_INFO[r.key] || '');
            const displayValue = (r.key === 'close' || r.key === 'ema9' || r.key === 'ema21' || r.key === 'ema50' || r.key === 'ema100' || r.key === 'ema200' || r.key === 'bbUpper' || r.key === 'bbMiddle' || r.key === 'bbLower')
              ? formatUSD(r.value)
              : (typeof r.value === 'number' ? r.value.toFixed(4) : String(r.value));

            return (
              <div key={r.key} style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 999, background: r.color || '#64748b' }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{r.name}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{displayValue}</div>
                </div>
                {desc && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{desc}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Token name mapping
  const getTokenName = (symbol) => {
    const tokenMap = {
      'BTCUSDT': 'Bitcoin (BTC)',
      'ETHUSDT': 'Ethereum (ETH)',
      'SOLUSDT': 'Solana (SOL)',
      'BNBUSDT': 'BNB (BNB)',
      'XRPUSDT': 'XRP (XRP)',
      'ADAUSDT': 'Cardano (ADA)',
      'DOGEUSDT': 'Dogecoin (DOGE)',
      'DOTUSDT': 'Polkadot (DOT)',
      'AVAXUSDT': 'Avalanche (AVAX)',
      'LINKUSDT': 'Chainlink (LINK)',
      'MATICUSDT': 'Polygon (MATIC)',
      'UNIUSDT': 'Uniswap (UNI)',
      'LTCUSDT': 'Litecoin (LTC)',
      'ATOMUSDT': 'Cosmos (ATOM)',
      'TRXUSDT': 'TRON (TRX)',
      'BCHUSDT': 'Bitcoin Cash (BCH)',
      'LUNAUSDT': 'Terra Luna (LUNA)',
      'NEARUSDT': 'NEAR Protocol (NEAR)',
      'APTUSDT': 'Aptos (APT)'
    };
    return tokenMap[symbol] || symbol;
  };

  // Token options for dropdown
  const tokenOptions = [
    { symbol: 'BTCUSDT', name: 'Bitcoin (BTC)' },
    { symbol: 'ETHUSDT', name: 'Ethereum (ETH)' },
    { symbol: 'SOLUSDT', name: 'Solana (SOL)' },
    { symbol: 'BNBUSDT', name: 'BNB (BNB)' },
    { symbol: 'XRPUSDT', name: 'XRP (XRP)' },
    { symbol: 'ADAUSDT', name: 'Cardano (ADA)' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin (DOGE)' },
    { symbol: 'DOTUSDT', name: 'Polkadot (DOT)' },
    { symbol: 'AVAXUSDT', name: 'Avalanche (AVAX)' },
    { symbol: 'LINKUSDT', name: 'Chainlink (LINK)' },
    { symbol: 'MATICUSDT', name: 'Polygon (MATIC)' },
    { symbol: 'UNIUSDT', name: 'Uniswap (UNI)' },
    { symbol: 'LTCUSDT', name: 'Litecoin (LTC)' },
    { symbol: 'ATOMUSDT', name: 'Cosmos (ATOM)' },
    { symbol: 'TRXUSDT', name: 'TRON (TRX)' },
    { symbol: 'BCHUSDT', name: 'Bitcoin Cash (BCH)' },
    { symbol: 'NEARUSDT', name: 'NEAR Protocol (NEAR)' },
    { symbol: 'APTUSDT', name: 'Aptos (APT)' }
  ];

  // Fetch initial historical data
  const fetchInitialData = async () => {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const candles = data.map(k => ({
        time: new Date(parseInt(k[0])).toLocaleTimeString(),
        timestamp: parseInt(k[0]),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5])
      }));

      setChartData(candles);
      dataBufferRef.current = candles;

      // Calculate initial price change
      if (candles.length >= 2) {
        const firstPrice = candles[0].open;
        const lastPrice = candles[candles.length - 1].close;
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
        setPriceChange(change);
        setCurrentPrice(lastPrice);
      }

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  // Connect to WebSocket
  const connectWebSocket = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return; // Already connected or connecting
    }

    try {
      // Determine WebSocket URL based on environment
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      if (apiBaseUrl === 'your_key_here' || !apiBaseUrl.startsWith('http')) {
        apiBaseUrl = 'http://localhost:8000';
      }
      const wsHost = apiBaseUrl.replace('http://', '').replace('https://', '');
      const wsUrl = `${wsProtocol}//${wsHost}/ws/prices`;

      console.log('Connecting to WebSocket:', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket connected for chart data');
        setIsStreaming(true);
        setLastUpdate(new Date().toLocaleTimeString());

        // Send subscription message to backend to start streaming specific symbol
        ws.send(JSON.stringify({
          type: 'subscribe_kline',
          symbol: symbol.toLowerCase(),
          interval: interval
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'kline_update') {
            const { symbol: receivedSymbol, kline } = message;

            if (receivedSymbol.toUpperCase() === symbol) {
              // Format the kline data to match our expected structure
              const formattedCandle = {
                time: new Date(parseInt(kline.t)).toLocaleTimeString(), // Open time
                timestamp: parseInt(kline.T), // Close time
                open: parseFloat(kline.o),
                high: parseFloat(kline.h),
                low: parseFloat(kline.l),
                close: parseFloat(kline.c),
                volume: parseFloat(kline.v)
              };

              // Update chart data with new candle
              setChartData(prevData => {
                const newData = [...prevData];

                // If this is the same time period as the last candle, update it
                const lastCandle = newData[newData.length - 1];
                if (lastCandle && lastCandle.timestamp === formattedCandle.timestamp) {
                  newData[newData.length - 1] = formattedCandle;
                } else {
                  // Otherwise, add the new candle and remove the oldest if we exceed 100
                  newData.push(formattedCandle);
                  if (newData.length > 100) {
                    newData.shift();
                  }
                }

                dataBufferRef.current = newData;

                // Update current price and calculate change
                const lastPrice = formattedCandle.close;
                setCurrentPrice(lastPrice);

                if (newData.length >= 2) {
                  const firstPrice = newData[0].open;
                  const change = ((lastPrice - firstPrice) / firstPrice) * 100;
                  setPriceChange(change);
                }

                setLastUpdate(new Date().toLocaleTimeString());
                return newData;
              });
            }
          } else if (message.type === 'price_update') {
            // Handle regular price updates if needed
            console.log('Received price update:', message);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsStreaming(false);

        // Attempt reconnection after a delay
        if (isStreaming) {
          console.log('Attempting to reconnect in 5 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isStreaming) {
              connectWebSocket();
            }
          }, 5000);
        }
      };

      wsRef.current = ws;

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  // Disconnect from WebSocket
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      // Send unsubscribe message before closing
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe_kline',
        symbol: symbol.toLowerCase(),
        interval: interval
      }));

      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsStreaming(false);
  };

  const startStreaming = async () => {
    await fetchInitialData(); // Load initial data first
    connectWebSocket();
  };

  const stopStreaming = () => {
    disconnectWebSocket();
  };





  // Handle symbol or interval changes
  useEffect(() => {
    if (!initialLoadRef.current && isStreaming) {
      // Restart streaming with new parameters
      disconnectWebSocket();
      setTimeout(() => {
        startStreaming();
      }, 1000);
    }
    initialLoadRef.current = false;
  }, [symbol, interval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Calculate technical indicators when data changes
  useEffect(() => {
    if (chartData.length < 2) {
      setCalculatedIndicators({});
      return;
    }

    const indicators = {};

    // Calculate EMAs
    if (selectedIndicators.ema9) {
      indicators.ema9 = calculateEMA(chartData, 9);
    }
    if (selectedIndicators.ema21) {
      indicators.ema21 = calculateEMA(chartData, 21);
    }
    if (selectedIndicators.ema50) {
      indicators.ema50 = calculateEMA(chartData, 50);
    }
    if (selectedIndicators.ema100) {
      indicators.ema100 = calculateEMA(chartData, 100);
    }
    if (selectedIndicators.ema200) {
      indicators.ema200 = calculateEMA(chartData, 200);
    }

    // Calculate RSI
    if (selectedIndicators.rsi) {
      indicators.rsi = calculateRSI(chartData, 14);
    }

    // Calculate MACD
    if (selectedIndicators.macd) {
      const macdData = calculateMACD(chartData);
      indicators.macd = macdData.macd;
      indicators.macdSignal = macdData.signal;
      indicators.macdHistogram = macdData.histogram;
    }

    // Calculate Bollinger Bands
    if (selectedIndicators.bollingerBands) {
      const bbData = calculateBollingerBands(chartData, 20, 2);
      indicators.bbUpper = bbData.upper;
      indicators.bbMiddle = bbData.middle;
      indicators.bbLower = bbData.lower;
    }

    // Calculate Support and Resistance
    if (selectedIndicators.supportResistance) {
      const srData = calculateSupportResistance(chartData, 20);

      // Filter to show only the closest support and resistance to current price
      const closestSupport = srData.support
        .filter(level => level.price < currentPrice)
        .sort((a, b) => b.price - a.price)
        .slice(0, 1); // Only show 1 closest support

      const closestResistance = srData.resistance
        .filter(level => level.price > currentPrice)
        .sort((a, b) => a.price - b.price)
        .slice(0, 1); // Only show 1 closest resistance

      indicators.support = closestSupport;
      indicators.resistance = closestResistance;
    }

    // Calculate ATR
    if (selectedIndicators.atr) {
      indicators.atr = calculateATR(chartData, 14);
    }

    setCalculatedIndicators(indicators);
  }, [chartData, selectedIndicators]);

  // Generate trading scenario simulation
  const generateScenario = (type, level) => {
    if (!chartData || chartData.length < 10) return null;

    const lastPrice = currentPrice;
    const lastCandle = chartData[chartData.length - 1];
    const avgVolatility = calculatedIndicators.atr ? getCurrentValue(calculatedIndicators.atr) : lastPrice * 0.02;

    // Generate projection based on scenario type
    const projectionSteps = 20; // Number of future candles to project
    const projection = [];

    if (type === 'long-support') {
      // Scenario: Price bounces off support
      let currentProjectedPrice = lastPrice;
      const bounceTarget = level.price + (avgVolatility * 2); // Target is 2x ATR above support
      const stopLoss = level.price - (avgVolatility * 0.5); // Stop loss below support

      for (let i = 0; i < projectionSteps; i++) {
        const progress = i / projectionSteps;

        // Simulate price moving down to support, then bouncing up
        if (i < 5) {
          // Moving towards support
          currentProjectedPrice = lastPrice - ((lastPrice - level.price) * (i / 5));
        } else if (i < 15) {
          // Bouncing up from support
          const bounceProgress = (i - 5) / 10;
          currentProjectedPrice = level.price + ((bounceTarget - level.price) * bounceProgress);
        } else {
          // Consolidating near target
          currentProjectedPrice = bounceTarget + (Math.random() - 0.5) * avgVolatility * 0.3;
        }

        projection.push({
          time: `+${i + 1}`,
          timestamp: lastCandle.timestamp + (i + 1) * 60000,
          close: null, // Don't show in main line
          projectionClose: currentProjectedPrice, // Show in projection line
          high: currentProjectedPrice + avgVolatility * 0.2,
          low: currentProjectedPrice - avgVolatility * 0.2,
          open: i === 0 ? lastPrice : (projection[i - 1]?.projectionClose || lastPrice),
          isProjection: true
        });
      }

      return {
        type: 'long-support',
        entryPrice: level.price,
        targetPrice: bounceTarget,
        stopLoss: stopLoss,
        potentialGain: ((bounceTarget - level.price) / level.price * 100).toFixed(2),
        potentialLoss: ((level.price - stopLoss) / level.price * 100).toFixed(2),
        riskRewardRatio: ((bounceTarget - level.price) / (level.price - stopLoss)).toFixed(2),
        projection: projection,
        description: `Long opportunity at support $${level.price.toFixed(2)}. If price bounces, potential gain of ${((bounceTarget - level.price) / level.price * 100).toFixed(2)}% to $${bounceTarget.toFixed(2)}.`
      };
    } else if (type === 'short-resistance') {
      // Scenario: Price rejects at resistance
      let currentProjectedPrice = lastPrice;
      const rejectTarget = level.price - (avgVolatility * 2); // Target is 2x ATR below resistance
      const stopLoss = level.price + (avgVolatility * 0.5); // Stop loss above resistance

      for (let i = 0; i < projectionSteps; i++) {
        if (i < 5) {
          // Moving towards resistance
          currentProjectedPrice = lastPrice + ((level.price - lastPrice) * (i / 5));
        } else if (i < 15) {
          // Rejecting down from resistance
          const rejectProgress = (i - 5) / 10;
          currentProjectedPrice = level.price - ((level.price - rejectTarget) * rejectProgress);
        } else {
          // Consolidating near target
          currentProjectedPrice = rejectTarget + (Math.random() - 0.5) * avgVolatility * 0.3;
        }

        projection.push({
          time: `+${i + 1}`,
          timestamp: lastCandle.timestamp + (i + 1) * 60000,
          close: null, // Don't show in main line
          projectionClose: currentProjectedPrice, // Show in projection line
          high: currentProjectedPrice + avgVolatility * 0.2,
          low: currentProjectedPrice - avgVolatility * 0.2,
          open: i === 0 ? lastPrice : (projection[i - 1]?.projectionClose || lastPrice),
          isProjection: true
        });
      }

      return {
        type: 'short-resistance',
        entryPrice: level.price,
        targetPrice: rejectTarget,
        stopLoss: stopLoss,
        potentialGain: ((level.price - rejectTarget) / level.price * 100).toFixed(2),
        potentialLoss: ((stopLoss - level.price) / level.price * 100).toFixed(2),
        riskRewardRatio: ((level.price - rejectTarget) / (stopLoss - level.price)).toFixed(2),
        projection: projection,
        description: `Short opportunity at resistance $${level.price.toFixed(2)}. If price rejects, potential gain of ${((level.price - rejectTarget) / level.price * 100).toFixed(2)}% to $${rejectTarget.toFixed(2)}.`
      };
    } else if (type === 'breakout-resistance') {
      // Scenario: Price breaks through resistance
      let currentProjectedPrice = lastPrice;
      const breakoutTarget = level.price + (avgVolatility * 3); // Target is 3x ATR above resistance
      const stopLoss = level.price - (avgVolatility * 0.3); // Tight stop below resistance

      for (let i = 0; i < projectionSteps; i++) {
        if (i < 5) {
          // Moving towards resistance
          currentProjectedPrice = lastPrice + ((level.price - lastPrice) * (i / 5));
        } else if (i < 15) {
          // Breaking through and rallying
          const breakProgress = (i - 5) / 10;
          currentProjectedPrice = level.price + ((breakoutTarget - level.price) * breakProgress);
        } else {
          // Consolidating above resistance
          currentProjectedPrice = breakoutTarget + (Math.random() - 0.5) * avgVolatility * 0.4;
        }

        projection.push({
          time: `+${i + 1}`,
          timestamp: lastCandle.timestamp + (i + 1) * 60000,
          close: currentProjectedPrice,
          high: currentProjectedPrice + avgVolatility * 0.3,
          low: currentProjectedPrice - avgVolatility * 0.2,
          open: i === 0 ? lastPrice : projection[i - 1].close,
          isProjection: true
        });
      }

      return {
        type: 'breakout-resistance',
        entryPrice: level.price,
        targetPrice: breakoutTarget,
        stopLoss: stopLoss,
        potentialGain: ((breakoutTarget - level.price) / level.price * 100).toFixed(2),
        potentialLoss: ((level.price - stopLoss) / level.price * 100).toFixed(2),
        riskRewardRatio: ((breakoutTarget - level.price) / (level.price - stopLoss)).toFixed(2),
        projection: projection,
        description: `Breakout opportunity above resistance $${level.price.toFixed(2)}. If price breaks through, potential gain of ${((breakoutTarget - level.price) / level.price * 100).toFixed(2)}% to $${breakoutTarget.toFixed(2)}.`
      };
    } else if (type === 'breakdown-support') {
      // Scenario: Price breaks below support
      let currentProjectedPrice = lastPrice;
      const breakdownTarget = level.price - (avgVolatility * 3); // Target is 3x ATR below support
      const stopLoss = level.price + (avgVolatility * 0.3); // Tight stop above support

      for (let i = 0; i < projectionSteps; i++) {
        if (i < 5) {
          // Moving towards support
          currentProjectedPrice = lastPrice - ((lastPrice - level.price) * (i / 5));
        } else if (i < 15) {
          // Breaking down
          const breakProgress = (i - 5) / 10;
          currentProjectedPrice = level.price - ((level.price - breakdownTarget) * breakProgress);
        } else {
          // Consolidating below support
          currentProjectedPrice = breakdownTarget + (Math.random() - 0.5) * avgVolatility * 0.4;
        }

        projection.push({
          time: `+${i + 1}`,
          timestamp: lastCandle.timestamp + (i + 1) * 60000,
          close: currentProjectedPrice,
          high: currentProjectedPrice + avgVolatility * 0.2,
          low: currentProjectedPrice - avgVolatility * 0.3,
          open: i === 0 ? lastPrice : projection[i - 1].close,
          isProjection: true
        });
      }

      return {
        type: 'breakdown-support',
        entryPrice: level.price,
        targetPrice: breakdownTarget,
        stopLoss: stopLoss,
        potentialGain: ((level.price - breakdownTarget) / level.price * 100).toFixed(2),
        potentialLoss: ((stopLoss - level.price) / level.price * 100).toFixed(2),
        riskRewardRatio: ((level.price - breakdownTarget) / (stopLoss - level.price)).toFixed(2),
        projection: projection,
        description: `Breakdown opportunity below support $${level.price.toFixed(2)}. If price breaks down, potential gain of ${((level.price - breakdownTarget) / level.price * 100).toFixed(2)}% to $${breakdownTarget.toFixed(2)}.`
      };
    }

    return null;
  };

  const formatPrice = (price) => {
    return formatUSD(price);
  };

  const formatVolume = (volume) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`;
    } else {
      return `$${volume.toFixed(2)}`;
    }
  };

  // Prepare chart data with indicators
  const chartDataWithIndicators = chartData.map((candle, i) => {
    const point = { ...candle };

    // Add EMA values
    if (calculatedIndicators.ema9) point.ema9 = calculatedIndicators.ema9[i];
    if (calculatedIndicators.ema21) point.ema21 = calculatedIndicators.ema21[i];
    if (calculatedIndicators.ema50) point.ema50 = calculatedIndicators.ema50[i];
    if (calculatedIndicators.ema100) point.ema100 = calculatedIndicators.ema100[i];
    if (calculatedIndicators.ema200) point.ema200 = calculatedIndicators.ema200[i];

    // Add Bollinger Bands
    if (calculatedIndicators.bbUpper) {
      point.bbUpper = calculatedIndicators.bbUpper[i];
      point.bbMiddle = calculatedIndicators.bbMiddle[i];
      point.bbLower = calculatedIndicators.bbLower[i];
    }

    // Add custom indicators
    indicators.forEach(ind => {
      if (ind.values[i] !== null && ind.values[i] !== undefined) {
        point[`indicator_${ind.id}__${ind.name.replace(/\s+/g, '_')}`] = ind.values[i];
      }
    });

    return point;
  });

  // Generate transition data: price moving from current to entry point
  const generateTransitionData = () => {
    if (!simulationActive || !scenarioData || chartData.length === 0) return [];

    const lastCandle = chartDataWithIndicators[chartDataWithIndicators.length - 1];
    const currentPrice = lastCandle.close;
    const entryPrice = scenarioData.entryPrice;
    const transitionSteps = 8; // Steps to reach entry
    const transition = [];

    for (let i = 0; i < transitionSteps; i++) {
      const progress = (i + 1) / transitionSteps;
      const price = currentPrice + (entryPrice - currentPrice) * progress;
      const timestamp = lastCandle.timestamp + (i + 1) * 60000;

      transition.push({
        time: `→${i + 1}`,
        timestamp: timestamp,
        close: null, // Don't show in main line
        projectionClose: price, // Show in projection line
        high: price + Math.abs(entryPrice - currentPrice) * 0.1,
        low: price - Math.abs(entryPrice - currentPrice) * 0.1,
        open: i === 0 ? currentPrice : transition[i - 1].projectionClose,
        isTransition: true,
        isProjection: true
      });
    }

    return transition;
  };

  // Animation loop
  useEffect(() => {
    if (!isAnimating || !simulationActive || !scenarioData) {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      return;
    }

    const transitionSteps = 8;
    const projectionSteps = scenarioData.projection?.length || 20;
    const totalSteps = transitionSteps + projectionSteps;

    animationIntervalRef.current = setInterval(() => {
      setAnimationStep(prev => {
        if (prev >= totalSteps - 1) {
          setIsAnimating(false);
          return prev;
        }
        const newStep = prev + 1;
        // Update simulation time
        if (scenarioData && scenarioData.projection && newStep > transitionSteps) {
          const projectionIndex = newStep - transitionSteps - 1;
          if (projectionIndex >= 0 && projectionIndex < scenarioData.projection.length) {
            const proj = scenarioData.projection[projectionIndex];
            if (proj.timestamp) {
              setCurrentSimulationTime(new Date(proj.timestamp).toLocaleString());
            }
          }
        }
        return newStep;
      });
    }, animationSpeed);

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [isAnimating, simulationActive, scenarioData, animationSpeed]);

  // Reset animation when scenario changes
  useEffect(() => {
    if (simulationActive && scenarioData) {
      setAnimationStep(0);
      setIsAnimating(false);
    }
  }, [scenarioData?.type, scenarioData?.entryPrice]);

  // Update animation speed based on playbackSpeed
  useEffect(() => {
    const speedMap = { 1: 300, 2: 150, 5: 60, 10: 30 };
    setAnimationSpeed(speedMap[playbackSpeed] || 300);
  }, [playbackSpeed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Space for play/pause
      if (e.code === 'Space' && simulationActive && scenarioData) {
        e.preventDefault();
        setIsAnimating(prev => !prev);
      }
      // Arrow keys for speed
      if (e.code === 'ArrowRight' && simulationActive) {
        e.preventDefault();
        const speeds = [1, 2, 5, 10];
        const currentIndex = speeds.indexOf(playbackSpeed);
        if (currentIndex < speeds.length - 1) {
          setPlaybackSpeed(speeds[currentIndex + 1]);
        }
      }
      if (e.code === 'ArrowLeft' && simulationActive) {
        e.preventDefault();
        const speeds = [1, 2, 5, 10];
        const currentIndex = speeds.indexOf(playbackSpeed);
        if (currentIndex > 0) {
          setPlaybackSpeed(speeds[currentIndex - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [simulationActive, scenarioData, playbackSpeed]);

  // Add scenario projection to chart data if active (with animation)
  const transitionData = generateTransitionData();
  const baseFullData = (simulationActive && scenarioData?.projection
    ? [
      ...chartDataWithIndicators,
      ...transitionData.slice(0, Math.max(0, animationStep)),
      ...scenarioData.projection.slice(0, Math.max(0, animationStep - transitionData.length))
    ]
    : chartDataWithIndicators);

  const fullChartData = baseFullData.map((item, idx, arr) => {
    let newItem = { ...item };

    if (showPattern && patternData?.data) {
      const patternPoints = patternData.data;
      const patternStartIdx = Math.max(0, arr.length - patternPoints.length);

      if (idx >= patternStartIdx) {
        const pIdx = idx - patternStartIdx;

        if (pIdx >= 0 && pIdx < patternPoints.length) {
          // Main pattern line
          newItem.patternValue = patternPoints[pIdx].y;

          // Pattern Trendlines (interpolate sloped lines)
          patternData.trendlines?.forEach((tl, tlIdx) => {
            if (pIdx >= tl.x1 && pIdx <= tl.x2) {
              const progress = (pIdx - tl.x1) / (tl.x2 - tl.x1 || 1);
              const y = tl.y1 + (tl.y2 - tl.y1) * progress;
              newItem[`patternTrendline_${tlIdx}`] = y;
            }
          });

          // Pattern Annotations
          patternData.annotations?.forEach((ann, annIdx) => {
            if (Math.round(pIdx) === Math.round(ann.x)) {
              newItem[`patternAnnotation_${annIdx}`] = ann.y;
              newItem[`patternAnnotationLabel_${annIdx}`] = ann.label;
              newItem[`patternAnnotationType_${annIdx}`] = ann.type;
            }
          });
        }
      }
    }
    return newItem;
  });

  // Render chart based on selected type
  const renderChart = () => {
    const xInterval = getXAxisInterval(fullChartData.length);
    const chartMargin = { top: 24, right: 28, left: 10, bottom: showVolume ? 50 : 18 }; // more space for volume
    const gridStroke = '#e2e8f0'; // subtle gridlines
    const axisTickStyle = { fontSize: '12px', fill: '#64748b', fontFamily: 'monospace' };
    const axisStroke = '#cbd5e1';

    // Subtle glow so lines "pop" without harshness
    const priceGlow = 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.35))';

    // Use ComposedChart if volume is enabled, otherwise use AreaChart/LineChart
    if (showVolume) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={fullChartData} margin={chartMargin}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="2 2"
              stroke={gridStroke}
              opacity={0.4}
            />
            <XAxis
              dataKey="time"
              stroke={axisStroke}
              tick={axisTickStyle}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              interval={xInterval}
              tickFormatter={(_, idx) => formatXAxisLabel(fullChartData[idx])}
            />
            <YAxis
              yAxisId="price"
              domain={['auto', 'auto']}
              stroke={axisStroke}
              tick={axisTickStyle}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              tickFormatter={(value) => formatUSD(value)}
              width={80}
            />
            <YAxis
              yAxisId="volume"
              orientation="right"
              domain={['auto', 'auto']}
              stroke={axisStroke}
              tick={axisTickStyle}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              tickFormatter={(value) => formatVolume(value)}
              width={60}
            />
            <Tooltip cursor={<CrosshairCursor />} content={<CustomTooltip />} />
            <Legend />

            {/* Volume Bars */}
            <Bar
              yAxisId="volume"
              dataKey="volume"
              fill="#94a3b8"
              opacity={0.3}
              name="Volume"
              isAnimationActive={false}
            />

            {/* Bollinger Bands */}
            {selectedIndicators.bollingerBands && calculatedIndicators.bbUpper && (
              <>
                <Line yAxisId="price" type="monotone" dataKey="bbUpper" stroke="#fbbf24" strokeWidth={1} dot={false} strokeDasharray="3 3" name="BB Upper" isAnimationActive={false} />
                <Line yAxisId="price" type="monotone" dataKey="bbMiddle" stroke="#f59e0b" strokeWidth={1} dot={false} name="BB Middle" isAnimationActive={false} />
                <Line yAxisId="price" type="monotone" dataKey="bbLower" stroke="#fbbf24" strokeWidth={1} dot={false} strokeDasharray="3 3" name="BB Lower" isAnimationActive={false} />
              </>
            )}

            {/* EMAs */}
            {selectedIndicators.ema9 && calculatedIndicators.ema9 && (
              <Line yAxisId="price" type="monotone" dataKey="ema9" stroke="#3b82f6" strokeWidth={2} dot={false} name="EMA 9" isAnimationActive={false} />
            )}
            {selectedIndicators.ema21 && calculatedIndicators.ema21 && (
              <Line yAxisId="price" type="monotone" dataKey="ema21" stroke="#8b5cf6" strokeWidth={2} dot={false} name="EMA 21" isAnimationActive={false} />
            )}
            {selectedIndicators.ema50 && calculatedIndicators.ema50 && (
              <Line yAxisId="price" type="monotone" dataKey="ema50" stroke="#ec4899" strokeWidth={2} dot={false} name="EMA 50" isAnimationActive={false} />
            )}
            {selectedIndicators.ema100 && calculatedIndicators.ema100 && (
              <Line yAxisId="price" type="monotone" dataKey="ema100" stroke="#f97316" strokeWidth={2} dot={false} name="EMA 100" isAnimationActive={false} />
            )}
            {selectedIndicators.ema200 && calculatedIndicators.ema200 && (
              <Line yAxisId="price" type="monotone" dataKey="ema200" stroke="#ef4444" strokeWidth={2} dot={false} name="EMA 200" isAnimationActive={false} />
            )}

            {/* Support and Resistance Lines */}
            {selectedIndicators.supportResistance && calculatedIndicators.support && calculatedIndicators.support.map((level, idx) => (
              <ReferenceLine
                key={`support-${idx}`}
                yAxisId="price"
                y={level.price}
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="8 4"
                strokeOpacity={0.8}
                label={{ value: `S: ${formatUSD(level.price)}`, position: 'left', fill: '#22c55e', fontSize: 10, fontWeight: 600 }}
              />
            ))}
            {selectedIndicators.supportResistance && calculatedIndicators.resistance && calculatedIndicators.resistance.map((level, idx) => (
              <ReferenceLine
                key={`resistance-${idx}`}
                yAxisId="price"
                y={level.price}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="8 4"
                strokeOpacity={0.8}
                label={{ value: `R: ${formatUSD(level.price)}`, position: 'left', fill: '#ef4444', fontSize: 10, fontWeight: 600 }}
              />
            ))}

            {/* Scenario Reference Lines */}
            {simulationActive && scenarioData && (
              <>
                <ReferenceLine yAxisId="price" y={scenarioData.entryPrice} stroke="#fbbf24" strokeWidth={2} strokeDasharray="3 3" label={{ value: `Entry: $${scenarioData.entryPrice.toFixed(2)}`, fill: '#fbbf24', fontSize: 11, fontWeight: 'bold' }} />
                <ReferenceLine yAxisId="price" y={scenarioData.targetPrice} stroke="#22c55e" strokeWidth={2} label={{ value: `Target: $${scenarioData.targetPrice.toFixed(2)}`, fill: '#22c55e', fontSize: 11, fontWeight: 'bold' }} />
                <ReferenceLine yAxisId="price" y={scenarioData.stopLoss} stroke="#ef4444" strokeWidth={2} label={{ value: `Stop: $${scenarioData.stopLoss.toFixed(2)}`, fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
              </>
            )}

            {/* Main Price Area */}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="close"
              stroke="#8b5cf6"
              fill="url(#colorGradient)"
              strokeWidth={3}
              name="Price"
              isAnimationActive={false}
              activeDot={{ r: 4, stroke: '#6d28d9', strokeWidth: 2, fill: '#ffffff' }}
              style={{ filter: priceGlow }}
              connectNulls={false}
            />

            {/* Projection Line - Animated scenario projection */}
            {simulationActive && scenarioData && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="projectionClose"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="8 4"
                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#ffffff' }}
                name="Projection"
                isAnimationActive={false}
                connectNulls={true}
                style={{ opacity: 0.9 }}
              />
            )}

            {/* Custom Indicators */}
            {indicators.map(ind => (
              <Line
                key={ind.id}
                yAxisId="price"
                type="monotone"
                dataKey={`indicator_${ind.id}__${ind.name.replace(/\s+/g, '_')}`}
                stroke={ind.color}
                strokeWidth={2}
                dot={false}
                name={ind.name}
                isAnimationActive={false}
              />
            ))}

            {/* Pattern Overlay - AI-generated pattern visualization */}
            {showPattern && patternData && (
              <>
                {/* Main pattern connecting points */}
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="patternValue"
                  stroke={patternData.direction === 'bullish' ? '#22c55e' : patternData.direction === 'bearish' ? '#ef4444' : '#8b5cf6'}
                  strokeWidth={4}
                  strokeDasharray="5 5"
                  dot={false}
                  name={patternData.pattern_name?.replace(/_/g, ' ').toUpperCase() || 'Pattern'}
                  isAnimationActive={false}
                  connectNulls={true}
                  style={{
                    opacity: 1,
                    filter: `drop-shadow(0px 0px 8px ${patternData.direction === 'bullish' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'})`,
                    zIndex: 100
                  }}
                />

                {/* Pattern Trendlines */}
                {patternData.trendlines?.map((tl, idx) => (
                  <Line
                    key={`tl-${idx}`}
                    yAxisId="price"
                    type="linear"
                    dataKey={`patternTrendline_${idx}`}
                    stroke={tl.color || '#f59e0b'}
                    strokeWidth={3}
                    dot={false}
                    name={tl.label || 'Trendline'}
                    isAnimationActive={false}
                    connectNulls={true}
                    style={{ opacity: 0.9, filter: 'drop-shadow(0px 0px 4px rgba(245, 158, 11, 0.5))' }}
                  />
                ))}

                {/* Pattern Annotations */}
                {patternData.annotations?.map((ann, idx) => (
                  <Line
                    key={`ann-${idx}`}
                    yAxisId="price"
                    type="monotone"
                    dataKey={`patternAnnotation_${idx}`}
                    stroke="transparent"
                    dot={{
                      r: 6,
                      fill: ann.type === 'peak' ? '#ef4444' : ann.type === 'valley' ? '#22c55e' : '#f59e0b',
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                    name={ann.label}
                    isAnimationActive={false}
                    connectNulls={true}
                    label={{
                      value: ann.label,
                      position: 'top',
                      fill: '#334155',
                      fontSize: 10,
                      fontWeight: 800,
                      offset: 10,
                      background: 'rgba(255,255,255,0.8)',
                      borderRadius: 4,
                      padding: 2
                    }}
                  />
                ))}
              </>
            )}



            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={fullChartData} margin={chartMargin}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="2 2"
              stroke={gridStroke}
              opacity={0.4}
            />
            <XAxis
              dataKey="time"
              stroke={axisStroke}
              tick={axisTickStyle}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              interval={xInterval}
              tickFormatter={(_, idx) => formatXAxisLabel(fullChartData[idx])}
            />
            <YAxis
              domain={['auto', 'auto']}
              stroke={axisStroke}
              tick={axisTickStyle}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              tickFormatter={(value) => formatUSD(value)}
            />
            <Tooltip cursor={<CrosshairCursor />} content={<CustomTooltip />} />
            <Legend />

            {/* Bollinger Bands */}
            {selectedIndicators.bollingerBands && calculatedIndicators.bbUpper && (
              <>
                <Line type="monotone" dataKey="bbUpper" stroke="#fbbf24" strokeWidth={1} dot={false} strokeDasharray="3 3" name="BB Upper" isAnimationActive={false} />
                <Line type="monotone" dataKey="bbMiddle" stroke="#f59e0b" strokeWidth={1} dot={false} name="BB Middle" isAnimationActive={false} />
                <Line type="monotone" dataKey="bbLower" stroke="#fbbf24" strokeWidth={1} dot={false} strokeDasharray="3 3" name="BB Lower" isAnimationActive={false} />
              </>
            )}

            {/* EMAs */}
            {selectedIndicators.ema9 && calculatedIndicators.ema9 && (
              <Line type="monotone" dataKey="ema9" stroke="#3b82f6" strokeWidth={2} dot={false} name="EMA 9" isAnimationActive={false} />
            )}
            {selectedIndicators.ema21 && calculatedIndicators.ema21 && (
              <Line type="monotone" dataKey="ema21" stroke="#8b5cf6" strokeWidth={2} dot={false} name="EMA 21" isAnimationActive={false} />
            )}
            {selectedIndicators.ema50 && calculatedIndicators.ema50 && (
              <Line type="monotone" dataKey="ema50" stroke="#ec4899" strokeWidth={2} dot={false} name="EMA 50" isAnimationActive={false} />
            )}
            {selectedIndicators.ema100 && calculatedIndicators.ema100 && (
              <Line type="monotone" dataKey="ema100" stroke="#f97316" strokeWidth={2} dot={false} name="EMA 100" isAnimationActive={false} />
            )}
            {selectedIndicators.ema200 && calculatedIndicators.ema200 && (
              <Line type="monotone" dataKey="ema200" stroke="#ef4444" strokeWidth={2} dot={false} name="EMA 200" isAnimationActive={false} />
            )}

            {/* Support and Resistance Lines */}
            {selectedIndicators.supportResistance && calculatedIndicators.support && calculatedIndicators.support.map((level, idx) => (
              <ReferenceLine
                key={`support-${idx}`}
                y={level.price}
                stroke="#22c55e"
                strokeWidth={2.5}
                strokeDasharray="10 6"
                strokeOpacity={0.95}
                label={<SRLabel type="support" level={level} />}
              />
            ))}
            {selectedIndicators.supportResistance && calculatedIndicators.resistance && calculatedIndicators.resistance.map((level, idx) => (
              <ReferenceLine
                key={`resistance-${idx}`}
                y={level.price}
                stroke="#ef4444"
                strokeWidth={2.5}
                strokeDasharray="10 6"
                strokeOpacity={0.95}
                label={<SRLabel type="resistance" level={level} />}
              />
            ))}

            {/* Scenario Reference Lines */}
            {simulationActive && scenarioData && (
              <>
                <ReferenceLine y={scenarioData.entryPrice} stroke="#fbbf24" strokeWidth={2} strokeDasharray="3 3" label={{ value: `Entry: $${scenarioData.entryPrice.toFixed(2)}`, fill: '#fbbf24', fontSize: 11, fontWeight: 'bold' }} />
                <ReferenceLine y={scenarioData.targetPrice} stroke="#22c55e" strokeWidth={2} label={{ value: `Target: $${scenarioData.targetPrice.toFixed(2)}`, fill: '#22c55e', fontSize: 11, fontWeight: 'bold' }} />
                <ReferenceLine y={scenarioData.stopLoss} stroke="#ef4444" strokeWidth={2} label={{ value: `Stop: $${scenarioData.stopLoss.toFixed(2)}`, fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
              </>
            )}

            {/* Pattern Overlay - AI-generated pattern visualization */}
            {showPattern && patternData && (
              <>
                <Line
                  type="monotone"
                  dataKey="patternValue"
                  stroke={patternData.direction === 'bullish' ? '#22c55e' : patternData.direction === 'bearish' ? '#ef4444' : '#8b5cf6'}
                  strokeWidth={4}
                  strokeDasharray="5 5"
                  dot={false}
                  name={patternData.pattern_name?.replace(/_/g, ' ').toUpperCase() || 'Pattern'}
                  isAnimationActive={false}
                  connectNulls={true}
                  style={{
                    opacity: 1,
                    filter: `drop-shadow(0px 0px 8px ${patternData.direction === 'bullish' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'})`,
                    zIndex: 100
                  }}
                />
                {patternData.trendlines?.map((tl, idx) => (
                  <Line
                    key={`tl-area-${idx}`}
                    type="linear"
                    dataKey={`patternTrendline_${idx}`}
                    stroke={tl.color || '#f59e0b'}
                    strokeWidth={3}
                    dot={false}
                    name={tl.label || 'Trendline'}
                    isAnimationActive={false}
                    connectNulls={true}
                    style={{ opacity: 0.9 }}
                  />
                ))}
                {patternData.annotations?.map((ann, idx) => (
                  <Line
                    key={`ann-area-${idx}`}
                    type="monotone"
                    dataKey={`patternAnnotation_${idx}`}
                    stroke="transparent"
                    dot={{
                      r: 6,
                      fill: ann.type === 'peak' ? '#ef4444' : ann.type === 'valley' ? '#22c55e' : '#f59e0b',
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                    name={ann.label}
                    label={{
                      value: ann.label,
                      position: 'top',
                      fill: '#334155',
                      fontSize: 10,
                      fontWeight: 800,
                      offset: 10
                    }}
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                ))}
              </>
            )}


            {/* Main Price Area */}
            <Area
              type="monotone"
              dataKey="close"
              stroke="#8b5cf6"
              fill="url(#colorGradient)"
              strokeWidth={3}
              name="Price"
              isAnimationActive={false}
              activeDot={{ r: 4, stroke: '#6d28d9', strokeWidth: 2, fill: '#ffffff' }}
              style={{ filter: priceGlow }}
              connectNulls={false}
            />

            {/* Projection Line - Animated scenario projection */}
            {simulationActive && scenarioData && (
              <Line
                type="monotone"
                dataKey="projectionClose"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="8 4"
                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#ffffff' }}
                name="Projection"
                isAnimationActive={false}
                connectNulls={true}
                style={{ opacity: 0.9 }}
              />
            )}

            {/* Custom Indicators */}
            {indicators.map(ind => (
              <Line
                key={ind.id}
                type="monotone"
                dataKey={`indicator_${ind.id}__${ind.name.replace(/\s+/g, '_')}`}
                stroke={ind.color}
                strokeWidth={2}
                dot={false}
                name={ind.name}
                isAnimationActive={false}
              />
            ))}

            {/* Pattern Overlay */}
            {showPattern && patternData && (
              <Line
                type="monotone"
                dataKey="patternValue"
                stroke="#10b981"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                name={patternData.pattern_name?.replace(/_/g, ' ').toUpperCase() || 'Pattern'}
                isAnimationActive={true}
                animationDuration={1000}
                connectNulls={true}
                style={{ opacity: 0.85 }}
              />
            )}


            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={fullChartData} margin={chartMargin}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="2 2"
              stroke={gridStroke}
              opacity={0.4}
            />
            <XAxis
              dataKey="time"
              stroke={axisStroke}
              tick={axisTickStyle}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              interval={xInterval}
              tickFormatter={(_, idx) => formatXAxisLabel(fullChartData[idx])}
            />
            <YAxis
              domain={['auto', 'auto']}
              stroke={axisStroke}
              tick={axisTickStyle}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              tickFormatter={(value) => formatUSD(value)}
            />
            <Tooltip cursor={<CrosshairCursor />} content={<CustomTooltip />} />
            <Legend />

            {/* Bollinger Bands */}
            {selectedIndicators.bollingerBands && calculatedIndicators.bbUpper && (
              <>
                <Line type="monotone" dataKey="bbUpper" stroke="#fbbf24" strokeWidth={1} dot={false} strokeDasharray="3 3" name="BB Upper" isAnimationActive={false} />
                <Line type="monotone" dataKey="bbMiddle" stroke="#f59e0b" strokeWidth={1} dot={false} name="BB Middle" isAnimationActive={false} />
                <Line type="monotone" dataKey="bbLower" stroke="#fbbf24" strokeWidth={1} dot={false} strokeDasharray="3 3" name="BB Lower" isAnimationActive={false} />
              </>
            )}

            {/* EMAs */}
            {selectedIndicators.ema9 && calculatedIndicators.ema9 && (
              <Line type="monotone" dataKey="ema9" stroke="#3b82f6" strokeWidth={2} dot={false} name="EMA 9" isAnimationActive={false} />
            )}
            {selectedIndicators.ema21 && calculatedIndicators.ema21 && (
              <Line type="monotone" dataKey="ema21" stroke="#8b5cf6" strokeWidth={2} dot={false} name="EMA 21" isAnimationActive={false} />
            )}
            {selectedIndicators.ema50 && calculatedIndicators.ema50 && (
              <Line type="monotone" dataKey="ema50" stroke="#ec4899" strokeWidth={2} dot={false} name="EMA 50" isAnimationActive={false} />
            )}
            {selectedIndicators.ema100 && calculatedIndicators.ema100 && (
              <Line type="monotone" dataKey="ema100" stroke="#f97316" strokeWidth={2} dot={false} name="EMA 100" isAnimationActive={false} />
            )}
            {selectedIndicators.ema200 && calculatedIndicators.ema200 && (
              <Line type="monotone" dataKey="ema200" stroke="#ef4444" strokeWidth={2} dot={false} name="EMA 200" isAnimationActive={false} />
            )}

            {/* Support and Resistance Lines */}
            {selectedIndicators.supportResistance && calculatedIndicators.support && calculatedIndicators.support.map((level, idx) => (
              <ReferenceLine
                key={`support-${idx}`}
                y={level.price}
                stroke="#22c55e"
                strokeWidth={2.5}
                strokeDasharray="10 6"
                strokeOpacity={0.95}
                label={<SRLabel type="support" level={level} />}
              />
            ))}
            {selectedIndicators.supportResistance && calculatedIndicators.resistance && calculatedIndicators.resistance.map((level, idx) => (
              <ReferenceLine
                key={`resistance-${idx}`}
                y={level.price}
                stroke="#ef4444"
                strokeWidth={2.5}
                strokeDasharray="10 6"
                strokeOpacity={0.95}
                label={<SRLabel type="resistance" level={level} />}
              />
            ))}

            {/* Scenario Reference Lines */}
            {simulationActive && scenarioData && (
              <>
                <ReferenceLine y={scenarioData.entryPrice} stroke="#fbbf24" strokeWidth={2} strokeDasharray="3 3" label={{ value: `Entry: $${scenarioData.entryPrice.toFixed(2)}`, fill: '#fbbf24', fontSize: 11, fontWeight: 'bold' }} />
                <ReferenceLine y={scenarioData.targetPrice} stroke="#22c55e" strokeWidth={2} label={{ value: `Target: $${scenarioData.targetPrice.toFixed(2)}`, fill: '#22c55e', fontSize: 11, fontWeight: 'bold' }} />
                <ReferenceLine y={scenarioData.stopLoss} stroke="#ef4444" strokeWidth={2} label={{ value: `Stop: $${scenarioData.stopLoss.toFixed(2)}`, fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
              </>
            )}

            {/* Main Price Line */}
            <Line
              type="monotone"
              dataKey="close"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={false}
              name="Price"
              isAnimationActive={false}
              activeDot={{ r: 4, stroke: '#6d28d9', strokeWidth: 2, fill: '#ffffff' }}
              style={{ filter: priceGlow }}
              connectNulls={false}
            />

            {/* Projection Line - Animated scenario projection */}
            {simulationActive && scenarioData && (
              <Line
                type="monotone"
                dataKey="projectionClose"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="8 4"
                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#ffffff' }}
                name="Projection"
                isAnimationActive={false}
                connectNulls={true}
                style={{ opacity: 0.9 }}
              />
            )}

            {/* Pattern Overlay - AI-generated pattern visualization */}
            {showPattern && patternData && (
              <>
                <Line
                  type="monotone"
                  dataKey="patternValue"
                  stroke={patternData.direction === 'bullish' ? '#22c55e' : patternData.direction === 'bearish' ? '#ef4444' : '#8b5cf6'}
                  strokeWidth={4}
                  strokeDasharray="5 5"
                  dot={false}
                  name={patternData.pattern_name?.replace(/_/g, ' ').toUpperCase() || 'Pattern'}
                  isAnimationActive={false}
                  connectNulls={true}
                  style={{
                    opacity: 1,
                    filter: `drop-shadow(0px 0px 8px ${patternData.direction === 'bullish' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'})`,
                    zIndex: 100
                  }}
                />
                {patternData.trendlines?.map((tl, idx) => (
                  <Line
                    key={`tl-line-${idx}`}
                    type="linear"
                    dataKey={`patternTrendline_${idx}`}
                    stroke={tl.color || '#f59e0b'}
                    strokeWidth={3}
                    dot={false}
                    name={tl.label || 'Trendline'}
                    isAnimationActive={false}
                    connectNulls={true}
                    style={{ opacity: 0.9 }}
                  />
                ))}
                {patternData.annotations?.map((ann, idx) => (
                  <Line
                    key={`ann-line-${idx}`}
                    type="monotone"
                    dataKey={`patternAnnotation_${idx}`}
                    stroke="transparent"
                    dot={{
                      r: 6,
                      fill: ann.type === 'peak' ? '#ef4444' : ann.type === 'valley' ? '#22c55e' : '#f59e0b',
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                    name={ann.label}
                    label={{
                      value: ann.label,
                      position: 'top',
                      fill: '#334155',
                      fontSize: 10,
                      fontWeight: 800,
                      offset: 10
                    }}
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                ))}
              </>
            )}




            {/* Custom Indicators */}
            {indicators.map(ind => (
              <Line
                key={ind.id}
                type="monotone"
                dataKey={`indicator_${ind.id}__${ind.name.replace(/\s+/g, '_')}`}
                stroke={ind.color}
                strokeWidth={2}
                dot={false}
                name={ind.name}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="h-full bg-[#F8F9FA] flex flex-col overflow-hidden min-h-0">
      {/* Header Bar - Condensed Asset Info */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 shadow-sm">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">{symbol.replace('USDT', '/USDT')}</span>
              <span className="text-lg font-bold text-slate-900 font-mono">{formatPrice(currentPrice)}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${priceChange >= 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
                }`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>{isStreaming ? 'Live' : 'Stopped'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {lastUpdate && <span>Updated: {lastUpdate}</span>}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Chart Area - Dominates Screen */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Chart Controls Toolbar */}
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 flex-wrap">
            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-slate-50 rounded p-0.5">
              {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setInterval(tf)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-all ${interval === tf
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-300"></div>

            {/* Chart Type Selector */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setChartType('line')}
                className={`p-1.5 rounded transition-all ${chartType === 'line'
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="Line Chart"
              >
                <LineChartIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-1.5 rounded transition-all ${chartType === 'area'
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="Area Chart"
              >
                <BarChartIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="h-4 w-px bg-slate-300"></div>

            {/* Indicator Toggle */}
            <button
              onClick={() => setShowIndicatorPanel(!showIndicatorPanel)}
              className={`p-1.5 rounded transition-all ${showIndicatorPanel
                ? 'bg-purple-100 text-purple-600'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
              title="Indicators"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Volume Toggle */}
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`p-1.5 rounded transition-all ${showVolume
                ? 'bg-purple-100 text-purple-600'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
              title="Volume"
            >
              {showVolume ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <div className="flex-1"></div>

            {/* Token Selector */}
            <div className="relative">
              <button
                onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                className="px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded flex items-center gap-1"
              >
                {getTokenName(symbol)}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showTokenDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-50 max-h-60 overflow-y-auto">
                  {tokenOptions.map(option => (
                    <button
                      key={option.symbol}
                      onClick={() => {
                        setSymbol(option.symbol);
                        setShowTokenDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${symbol === option.symbol ? 'bg-purple-50 text-purple-600' : ''}`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Start/Stop Stream */}
            {!isStreaming ? (
              <button
                onClick={startStreaming}
                className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition-all flex items-center gap-1"
              >
                <PlayCircle className="w-3 h-3" />
                Start
              </button>
            ) : (
              <button
                onClick={stopStreaming}
                className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition-all flex items-center gap-1"
              >
                <StopCircle className="w-3 h-3" />
                Stop
              </button>
            )}
          </div>

          {/* Chart Container with Integrated Controls */}
          <div className="flex-1 relative bg-white">
            {/* OHLC Display - Top Left Overlay */}
            {hoveredData && (
              <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-2 shadow-lg">
                <div className="text-xs text-slate-500 mb-1 font-mono">{hoveredData.time}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div>
                    <span className="text-slate-500">O: </span>
                    <span className="font-mono font-semibold text-slate-900">{formatUSD(hoveredData.open)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">H: </span>
                    <span className="font-mono font-semibold text-green-600">{formatUSD(hoveredData.high)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">L: </span>
                    <span className="font-mono font-semibold text-red-600">{formatUSD(hoveredData.low)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">C: </span>
                    <span className="font-mono font-semibold text-slate-900">{formatUSD(hoveredData.close)}</span>
                  </div>
                </div>
                {hoveredData.volume && (
                  <div className="mt-1 pt-1 border-t border-slate-200 text-xs">
                    <span className="text-slate-500">Vol: </span>
                    <span className="font-mono text-slate-700">{formatVolume(hoveredData.volume)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Pattern Info Panel - Top Right Overlay */}
            {showPattern && patternData && (
              <div className="absolute top-4 right-4 z-20 bg-white backdrop-blur-sm border-2 border-purple-300 rounded-xl p-3 shadow-2xl max-w-xs">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                    <div className="text-sm font-bold text-purple-900">
                      {patternData.pattern_name?.replace(/_/g, ' ').toUpperCase() || 'Pattern'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowPattern(false);
                      setPatternData(null);
                      setShowPatternInfo(false);
                    }}
                    className="p-1 hover:bg-purple-100 rounded transition-colors"
                    title="Clear Pattern"
                  >
                    <X size={14} className="text-purple-700" />
                  </button>
                </div>
                <div className="text-xs text-slate-700 mb-3 leading-relaxed">
                  {patternData.description}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`flex-1 px-2 py-1 rounded-lg text-xs font-semibold text-center ${patternData.direction === 'bullish' ? 'bg-green-100 text-green-700' :
                    patternData.direction === 'bearish' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                    {patternData.direction}
                  </div>
                  <div className="flex-1 px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold text-center">
                    {patternData.pattern_type}
                  </div>
                </div>
                <button
                  onClick={() => setShowPatternInfo(true)}
                  className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Info className="w-3 h-3" />
                  Learn More
                </button>
              </div>
            )}


            {/* Active Scenario Overlay */}
            {simulationActive && scenarioData && (
              <div className="absolute top-4 right-4 z-20 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 shadow-lg">
                <div className="text-xs font-semibold text-yellow-800">
                  {scenarioData.type === 'long-support' && 'Long @ Support'}
                  {scenarioData.type === 'short-resistance' && 'Short @ Resistance'}
                  {scenarioData.type === 'breakout-resistance' && 'Breakout'}
                  {scenarioData.type === 'breakdown-support' && 'Breakdown'}
                </div>
              </div>
            )}

            {/* Chart */}
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 text-sm">Click "Start" to begin streaming</p>
                </div>
              </div>
            ) : (
              <div className="h-full p-2">
                <div className="h-full relative">
                  {renderChart()}

                  {/* Integrated Playback Controls - Bottom Right */}
                  {simulationActive && scenarioData && (
                    <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-xl">
                      {/* Playback Controls */}
                      <div className="flex items-center gap-2 mb-3">
                        {!isAnimating ? (
                          <button
                            onClick={() => setIsAnimating(true)}
                            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-all"
                            title="Play (Space)"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsAnimating(false)}
                            className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all"
                            title="Pause (Space)"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setAnimationStep(0);
                            setIsAnimating(false);
                          }}
                          className="p-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-all"
                          title="Reset"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        {/* Speed Controls */}
                        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-300">
                          {[1, 2, 5, 10].map(speed => (
                            <button
                              key={speed}
                              onClick={() => setPlaybackSpeed(speed)}
                              className={`px-2 py-1 text-xs font-medium rounded transition-all ${playbackSpeed === speed
                                ? 'bg-purple-100 text-purple-600'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Progress Slider */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600">Progress</span>
                          <span className="text-xs font-mono text-slate-700">
                            {scenarioData.projection ? Math.min(100, Math.round(((animationStep) / (8 + scenarioData.projection.length)) * 100)) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-purple-500 h-1.5 rounded-full transition-all duration-150"
                            style={{ width: `${scenarioData.projection ? Math.min(100, ((animationStep) / (8 + scenarioData.projection.length)) * 100) : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Timestamp Display */}
                      {currentSimulationTime && (
                        <div className="text-xs text-slate-500 font-mono">
                          {currentSimulationTime}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Right Sidebar for Scenarios */}
        <div className={`bg-white border-l border-slate-200 transition-all duration-200 ${isSidebarCollapsed ? 'w-0' : 'w-80'} flex flex-col overflow-hidden min-h-0`}>
          {!isSidebarCollapsed && (
            <>
              {/* Sidebar Header with Tabs */}
              <div className="border-b border-slate-200">
                <div className="px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('scenarios')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'scenarios'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      Scenarios
                    </button>
                    <button
                      onClick={() => setActiveTab('patterns')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${activeTab === 'patterns'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      Patterns
                    </button>
                  </div>
                  <button
                    onClick={() => setIsSidebarCollapsed(true)}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              {activeTab === 'scenarios' ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {!selectedIndicators.supportResistance || !calculatedIndicators.support || !calculatedIndicators.resistance ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-600 mb-4">Enable Support & Resistance to use scenarios</p>
                      <button
                        onClick={() => setSelectedIndicators(prev => ({ ...prev, supportResistance: true }))}
                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-all"
                      >
                        Enable S/R
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Support Scenarios */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Support</h4>
                        <div className="space-y-2">
                          {calculatedIndicators.support.slice(0, 2).map((level, idx) => (
                            <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-green-700">{formatPrice(level.price)}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <button
                                  onClick={() => {
                                    const scenario = generateScenario('long-support', level);
                                    setScenarioData(scenario);
                                    setSimulationActive(true);
                                  }}
                                  className={`px-2 py-1.5 text-xs font-medium rounded transition-all ${scenarioData?.type === 'long-support' && scenarioData?.entryPrice === level.price
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-green-700 border border-green-300 hover:bg-green-100'
                                    }`}
                                >
                                  Long
                                </button>
                                <button
                                  onClick={() => {
                                    const scenario = generateScenario('breakdown-support', level);
                                    setScenarioData(scenario);
                                    setSimulationActive(true);
                                  }}
                                  className={`px-2 py-1.5 text-xs font-medium rounded transition-all ${scenarioData?.type === 'breakdown-support' && scenarioData?.entryPrice === level.price
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white text-red-700 border border-red-300 hover:bg-red-100'
                                    }`}
                                >
                                  Breakdown
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resistance Scenarios */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Resistance</h4>
                        <div className="space-y-2">
                          {calculatedIndicators.resistance.slice(0, 2).map((level, idx) => (
                            <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-red-700">{formatPrice(level.price)}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <button
                                  onClick={() => {
                                    const scenario = generateScenario('short-resistance', level);
                                    setScenarioData(scenario);
                                    setSimulationActive(true);
                                  }}
                                  className={`px-2 py-1.5 text-xs font-medium rounded transition-all ${scenarioData?.type === 'short-resistance' && scenarioData?.entryPrice === level.price
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white text-red-700 border border-red-300 hover:bg-red-100'
                                    }`}
                                >
                                  Short
                                </button>
                                <button
                                  onClick={() => {
                                    const scenario = generateScenario('breakout-resistance', level);
                                    setScenarioData(scenario);
                                    setSimulationActive(true);
                                  }}
                                  className={`px-2 py-1.5 text-xs font-medium rounded transition-all ${scenarioData?.type === 'breakout-resistance' && scenarioData?.entryPrice === level.price
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-green-700 border border-green-300 hover:bg-green-100'
                                    }`}
                                >
                                  Breakout
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Active Scenario Details */}
                      {simulationActive && scenarioData && (
                        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="text-xs font-semibold text-purple-700 mb-2">Active Scenario</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Entry:</span>
                              <span className="font-mono font-semibold">{formatPrice(scenarioData.entryPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-600">Target:</span>
                              <span className="font-mono font-semibold text-green-600">{formatPrice(scenarioData.targetPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-600">Stop:</span>
                              <span className="font-mono font-semibold text-red-600">{formatPrice(scenarioData.stopLoss)}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-purple-200">
                              <span className="text-slate-600">R:R:</span>
                              <span className="font-mono font-semibold">{scenarioData.riskRewardRatio}:1</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSimulationActive(false);
                              setScenarioData(null);
                              setAnimationStep(0);
                              setIsAnimating(false);
                            }}
                            className="mt-2 w-full px-2 py-1 bg-white text-red-600 text-xs font-medium rounded border border-red-300 hover:bg-red-50 transition-all"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-hidden min-h-0">
                  <PatternChatPanel
                    onPatternGenerated={(pattern) => {
                      setPatternData(pattern);
                      setShowPattern(true);
                      setShowPatternInfo(false);
                    }}
                    currentPrice={currentPrice}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Toggle Button (when collapsed) */}
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-slate-200 border-r-0 rounded-l-lg p-2 shadow-lg hover:bg-slate-50 transition-colors z-10"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
        )}
      </div>

      {/* Indicator Panel (if enabled) */}
      {showIndicatorPanel && (
        <div className="bg-white border-t border-slate-200 px-4 py-3 max-h-64 overflow-y-auto">
          <div className="max-w-[1800px] mx-auto">
            {/* Indicator Toggles */}
            <div className="mb-3">
              <div className="text-xs font-semibold text-slate-600 mb-2">Toggle Indicators</div>
              <div className="flex items-center gap-2 flex-wrap">
                {Object.entries(selectedIndicators).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedIndicators(prev => ({ ...prev, [key]: !prev[key] }))}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${value
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Indicator Values */}
            {chartData.length > 0 && Object.keys(calculatedIndicators).length > 0 && (
              <div className="border-t border-slate-200 pt-3">
                <div className="text-xs font-semibold text-slate-600 mb-2">Current Values</div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {/* EMAs */}
                  {selectedIndicators.ema9 && calculatedIndicators.ema9 && (
                    <div className="bg-blue-50 rounded p-2 border border-blue-200">
                      <div className="text-xs text-blue-600 mb-0.5">EMA 9</div>
                      <div className="text-sm font-bold text-slate-800 font-mono">
                        {formatPrice(getCurrentValue(calculatedIndicators.ema9) || 0)}
                      </div>
                    </div>
                  )}
                  {selectedIndicators.ema21 && calculatedIndicators.ema21 && (
                    <div className="bg-purple-50 rounded p-2 border border-purple-200">
                      <div className="text-xs text-purple-600 mb-0.5">EMA 21</div>
                      <div className="text-sm font-bold text-slate-800 font-mono">
                        {formatPrice(getCurrentValue(calculatedIndicators.ema21) || 0)}
                      </div>
                    </div>
                  )}
                  {selectedIndicators.ema50 && calculatedIndicators.ema50 && (
                    <div className="bg-pink-50 rounded p-2 border border-pink-200">
                      <div className="text-xs text-pink-600 mb-0.5">EMA 50</div>
                      <div className="text-sm font-bold text-slate-800 font-mono">
                        {formatPrice(getCurrentValue(calculatedIndicators.ema50) || 0)}
                      </div>
                    </div>
                  )}
                  {selectedIndicators.ema100 && calculatedIndicators.ema100 && (
                    <div className="bg-orange-50 rounded p-2 border border-orange-200">
                      <div className="text-xs text-orange-600 mb-0.5">EMA 100</div>
                      <div className="text-sm font-bold text-slate-800 font-mono">
                        {formatPrice(getCurrentValue(calculatedIndicators.ema100) || 0)}
                      </div>
                    </div>
                  )}
                  {selectedIndicators.ema200 && calculatedIndicators.ema200 && (
                    <div className="bg-red-50 rounded p-2 border border-red-200">
                      <div className="text-xs text-red-600 mb-0.5">EMA 200</div>
                      <div className="text-sm font-bold text-slate-800 font-mono">
                        {formatPrice(getCurrentValue(calculatedIndicators.ema200) || 0)}
                      </div>
                    </div>
                  )}

                  {/* RSI */}
                  {selectedIndicators.rsi && calculatedIndicators.rsi && (
                    <div className="bg-cyan-50 rounded p-2 border border-cyan-200">
                      <div className="text-xs text-cyan-600 mb-0.5">RSI (14)</div>
                      <div className="flex items-center gap-1">
                        <div className="text-sm font-bold text-slate-800 font-mono">
                          {(getCurrentValue(calculatedIndicators.rsi) || 0).toFixed(2)}
                        </div>
                        <div className={`text-xs px-1 py-0.5 rounded ${(getCurrentValue(calculatedIndicators.rsi) || 0) > 70
                          ? 'bg-red-100 text-red-600'
                          : (getCurrentValue(calculatedIndicators.rsi) || 0) < 30
                            ? 'bg-green-100 text-green-600'
                            : 'bg-slate-100 text-slate-600'
                          }`}>
                          {(getCurrentValue(calculatedIndicators.rsi) || 0) > 70 ? 'OB' : (getCurrentValue(calculatedIndicators.rsi) || 0) < 30 ? 'OS' : 'N'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MACD */}
                  {selectedIndicators.macd && calculatedIndicators.macd && (
                    <div className="bg-indigo-50 rounded p-2 border border-indigo-200">
                      <div className="text-xs text-indigo-600 mb-0.5">MACD</div>
                      <div className="text-xs text-slate-800 space-y-0.5">
                        <div className="font-mono">L: {(getCurrentValue(calculatedIndicators.macd) || 0).toFixed(4)}</div>
                        <div className="font-mono">S: {(getCurrentValue(calculatedIndicators.macdSignal) || 0).toFixed(4)}</div>
                        <div className={`font-mono font-bold ${(getCurrentValue(calculatedIndicators.macdHistogram) || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          H: {(getCurrentValue(calculatedIndicators.macdHistogram) || 0).toFixed(4)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bollinger Bands */}
                  {selectedIndicators.bollingerBands && calculatedIndicators.bbUpper && (
                    <div className="bg-yellow-50 rounded p-2 border border-yellow-200">
                      <div className="text-xs text-yellow-600 mb-0.5">BB</div>
                      <div className="text-xs text-slate-800 space-y-0.5 font-mono">
                        <div>U: {formatPrice(getCurrentValue(calculatedIndicators.bbUpper) || 0)}</div>
                        <div>M: {formatPrice(getCurrentValue(calculatedIndicators.bbMiddle) || 0)}</div>
                        <div>L: {formatPrice(getCurrentValue(calculatedIndicators.bbLower) || 0)}</div>
                      </div>
                    </div>
                  )}

                  {/* Support & Resistance */}
                  {selectedIndicators.supportResistance && calculatedIndicators.support && calculatedIndicators.support.length > 0 && (
                    <div className="bg-green-50 rounded p-2 border border-green-200">
                      <div className="text-xs text-green-600 mb-0.5">Support</div>
                      <div className="text-xs text-slate-800 space-y-0.5 font-mono">
                        {calculatedIndicators.support.slice(0, 2).map((level, idx) => (
                          <div key={idx} className="text-green-600">
                            S{idx + 1}: {formatPrice(level.price)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedIndicators.supportResistance && calculatedIndicators.resistance && calculatedIndicators.resistance.length > 0 && (
                    <div className="bg-red-50 rounded p-2 border border-red-200">
                      <div className="text-xs text-red-600 mb-0.5">Resistance</div>
                      <div className="text-xs text-slate-800 space-y-0.5 font-mono">
                        {calculatedIndicators.resistance.slice(0, 2).map((level, idx) => (
                          <div key={idx} className="text-red-600">
                            R{idx + 1}: {formatPrice(level.price)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ATR */}
                  {selectedIndicators.atr && calculatedIndicators.atr && (
                    <div className="bg-teal-50 rounded p-2 border border-teal-200">
                      <div className="text-xs text-teal-600 mb-0.5">ATR (14)</div>
                      <div className="text-sm font-bold text-slate-800 font-mono">
                        {formatPrice(getCurrentValue(calculatedIndicators.atr) || 0)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pattern Info Card Overlay */}
      {showPatternInfo && patternData && (
        <PatternInfoCard
          pattern={patternData}
          onClose={() => setShowPatternInfo(false)}
        />
      )}
    </div>
  );
};

export default CryptoChartWebSocket;