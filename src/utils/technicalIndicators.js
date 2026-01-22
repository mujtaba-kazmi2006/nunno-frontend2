/**
 * Technical Indicators Calculation Utilities
 * Provides functions for calculating common technical indicators
 */

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array} data - Array of price data objects with 'close' property
 * @param {number} period - EMA period
 * @returns {Array} Array of EMA values
 */
export function calculateEMA(data, period) {
    if (!data || data.length < period) return [];

    const k = 2 / (period + 1);
    const emaArray = new Array(data.length).fill(null);

    // Calculate initial SMA for the first EMA value
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i].close;
    }
    emaArray[period - 1] = sum / period;

    // Calculate EMA for remaining values
    for (let i = period; i < data.length; i++) {
        emaArray[i] = data[i].close * k + emaArray[i - 1] * (1 - k);
    }

    return emaArray;
}

/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array} data - Array of price data
 * @param {number} period - SMA period
 * @returns {Array} Array of SMA values
 */
export function calculateSMA(data, period) {
    if (!data || data.length < period) return [];

    const smaArray = new Array(data.length).fill(null);

    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        smaArray[i] = sum / period;
    }

    return smaArray;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array} data - Array of price data
 * @param {number} period - RSI period (default 14)
 * @returns {Array} Array of RSI values
 */
export function calculateRSI(data, period = 14) {
    if (!data || data.length < period + 1) return [];

    const rsiArray = new Array(data.length).fill(null);
    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
        const change = data[i].close - data[i - 1].close;
        if (change >= 0) {
            gains += change;
        } else {
            losses -= change;
        }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate first RSI
    const rs = avgGain / avgLoss;
    rsiArray[period] = 100 - (100 / (1 + rs));

    // Calculate remaining RSI values using smoothed averages
    for (let i = period + 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        const gain = change >= 0 ? change : 0;
        const loss = change < 0 ? -change : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        const currentRS = avgGain / avgLoss;
        rsiArray[i] = 100 - (100 / (1 + currentRS));
    }

    return rsiArray;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {Array} data - Array of price data
 * @param {number} fastPeriod - Fast EMA period (default 12)
 * @param {number} slowPeriod - Slow EMA period (default 26)
 * @param {number} signalPeriod - Signal line period (default 9)
 * @returns {Object} Object with macd, signal, and histogram arrays
 */
export function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (!data || data.length < slowPeriod) {
        return { macd: [], signal: [], histogram: [] };
    }

    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);

    const macdLine = new Array(data.length).fill(null);
    for (let i = slowPeriod - 1; i < data.length; i++) {
        if (fastEMA[i] !== null && slowEMA[i] !== null) {
            macdLine[i] = fastEMA[i] - slowEMA[i];
        }
    }

    // Calculate signal line (EMA of MACD)
    const signalLine = new Array(data.length).fill(null);
    const macdData = macdLine.map((val, idx) => ({ close: val || 0 }));
    const signalEMA = calculateEMA(macdData.slice(slowPeriod - 1), signalPeriod);

    for (let i = 0; i < signalEMA.length; i++) {
        signalLine[slowPeriod - 1 + i] = signalEMA[i];
    }

    // Calculate histogram
    const histogram = new Array(data.length).fill(null);
    for (let i = 0; i < data.length; i++) {
        if (macdLine[i] !== null && signalLine[i] !== null) {
            histogram[i] = macdLine[i] - signalLine[i];
        }
    }

    return { macd: macdLine, signal: signalLine, histogram };
}

/**
 * Calculate Bollinger Bands
 * @param {Array} data - Array of price data
 * @param {number} period - Period for SMA (default 20)
 * @param {number} stdDev - Number of standard deviations (default 2)
 * @returns {Object} Object with upper, middle, and lower band arrays
 */
export function calculateBollingerBands(data, period = 20, stdDev = 2) {
    if (!data || data.length < period) {
        return { upper: [], middle: [], lower: [] };
    }

    const middle = calculateSMA(data, period);
    const upper = new Array(data.length).fill(null);
    const lower = new Array(data.length).fill(null);

    for (let i = period - 1; i < data.length; i++) {
        // Calculate standard deviation
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += Math.pow(data[i - j].close - middle[i], 2);
        }
        const sd = Math.sqrt(sum / period);

        upper[i] = middle[i] + (stdDev * sd);
        lower[i] = middle[i] - (stdDev * sd);
    }

    return { upper, middle, lower };
}

/**
 * Calculate Support and Resistance Levels
 * @param {Array} data - Array of price data with high and low
 * @param {number} lookback - Number of periods to look back (default 20)
 * @returns {Object} Object with support and resistance levels
 */
export function calculateSupportResistance(data, lookback = 20) {
    if (!data || data.length < lookback) {
        return { support: [], resistance: [] };
    }

    const supportLevels = [];
    const resistanceLevels = [];

    // Find local minima (support) and maxima (resistance)
    for (let i = lookback; i < data.length - lookback; i++) {
        let isSupport = true;
        let isResistance = true;

        const currentLow = data[i].low;
        const currentHigh = data[i].high;

        // Check if current point is a local minimum
        for (let j = i - lookback; j <= i + lookback; j++) {
            if (j !== i && data[j].low < currentLow) {
                isSupport = false;
                break;
            }
        }

        // Check if current point is a local maximum
        for (let j = i - lookback; j <= i + lookback; j++) {
            if (j !== i && data[j].high > currentHigh) {
                isResistance = false;
                break;
            }
        }

        if (isSupport) {
            supportLevels.push({ price: currentLow, index: i });
        }
        if (isResistance) {
            resistanceLevels.push({ price: currentHigh, index: i });
        }
    }

    // Get the most recent and significant levels
    const recentSupport = supportLevels.slice(-3);
    const recentResistance = resistanceLevels.slice(-3);

    return {
        support: recentSupport,
        resistance: recentResistance
    };
}

/**
 * Calculate Average True Range (ATR)
 * @param {Array} data - Array of price data with high, low, close
 * @param {number} period - ATR period (default 14)
 * @returns {Array} Array of ATR values
 */
export function calculateATR(data, period = 14) {
    if (!data || data.length < period + 1) return [];

    const trueRanges = new Array(data.length).fill(null);

    // Calculate True Range for each period
    for (let i = 1; i < data.length; i++) {
        const high = data[i].high;
        const low = data[i].low;
        const prevClose = data[i - 1].close;

        const tr = Math.max(
            high - low,
            Math.abs(high - prevClose),
            Math.abs(low - prevClose)
        );
        trueRanges[i] = tr;
    }

    // Calculate ATR using smoothed average
    const atrArray = new Array(data.length).fill(null);

    // Initial ATR is simple average
    let sum = 0;
    for (let i = 1; i <= period; i++) {
        sum += trueRanges[i];
    }
    atrArray[period] = sum / period;

    // Subsequent ATR values are smoothed
    for (let i = period + 1; i < data.length; i++) {
        atrArray[i] = (atrArray[i - 1] * (period - 1) + trueRanges[i]) / period;
    }

    return atrArray;
}

/**
 * Get current indicator values (most recent non-null value)
 * @param {Array} indicatorArray - Array of indicator values
 * @returns {number|null} Most recent value
 */
export function getCurrentValue(indicatorArray) {
    if (!indicatorArray || indicatorArray.length === 0) return null;

    for (let i = indicatorArray.length - 1; i >= 0; i--) {
        if (indicatorArray[i] !== null && indicatorArray[i] !== undefined) {
            return indicatorArray[i];
        }
    }
    return null;
}
