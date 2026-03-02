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

    const currentPrice = data[data.length - 1].close;
    const allPivots = [];

    // Find local minima (troughs) and maxima (peaks)
    for (let i = lookback; i < data.length - lookback; i++) {
        let isTrough = true;
        let isPeak = true;

        const currentLow = data[i].low;
        const currentHigh = data[i].high;

        // Check if current point is a local minimum
        for (let j = i - lookback; j <= i + lookback; j++) {
            if (j !== i && data[j].low < currentLow) {
                isTrough = false;
                break;
            }
        }

        // Check if current point is a local maximum
        for (let j = i - lookback; j <= i + lookback; j++) {
            if (j !== i && data[j].high > currentHigh) {
                isPeak = false;
                break;
            }
        }

        if (isTrough) {
            allPivots.push({ price: currentLow, index: i, originalType: 'support' });
        }
        if (isPeak) {
            allPivots.push({ price: currentHigh, index: i, originalType: 'resistance' });
        }
    }

    // Sort by index descending (most recent first)
    allPivots.sort((a, b) => b.index - a.index);

    // Merge levels that are very close (within 0.3%) and count touches
    const mergedLevels = [];
    const threshold = 0.003; // 0.3%

    for (const pivot of allPivots) {
        let matched = false;
        for (const existing of mergedLevels) {
            const diff = Math.abs(existing.price - pivot.price) / existing.price;
            if (diff < threshold) {
                matched = true;
                existing.touches += 1;
                // Keep the most recent index
                if (pivot.index > existing.index) existing.index = pivot.index;
                break;
            }
        }
        if (!matched) {
            mergedLevels.push({ ...pivot, touches: 1 });
        }
    }

    // Sort by touches (desc) then by index (desc)
    mergedLevels.sort((a, b) => b.touches - a.touches || b.index - a.index);

    // Classify based on current price
    const support = [];
    const resistance = [];

    mergedLevels.forEach(level => {
        const isFlipped = (level.originalType === 'resistance' && level.price < currentPrice) ||
            (level.originalType === 'support' && level.price > currentPrice);

        const isStrong = level.touches >= 2;

        const finalLevel = {
            ...level,
            isFlipped,
            isStrong,
            label: level.price < currentPrice ? (isFlipped ? 'SR-Flip' : 'Support') : (isFlipped ? 'RS-Flip' : 'Resistance')
        };

        if (level.price < currentPrice) {
            support.push(finalLevel);
        } else {
            resistance.push(finalLevel);
        }
    });

    return {
        support: support.slice(0, 6), // Return up to 6 support levels
        resistance: resistance.slice(0, 6) // Return up to 6 resistance levels
    };
}

/**
 * Calculate Enhanced Support and Resistance Levels (VWPD & Order Blocks)
 * @param {Array} data - Array of price data with high, low, close, volume
 * @param {number} lookback - Number of periods to look back (default 150)
 * @returns {Object} Object with support and resistance levels
 */
export function calculateEnhancedSupportResistance(data, lookback = 150) {
    if (!data || data.length < lookback) {
        lookback = data.length;
    }
    if (lookback < 20) return { support: [], resistance: [] };

    const currentPrice = data[data.length - 1].close;
    const startIndex = data.length - lookback;

    // 1. VWPD (Volume Weighted Price Density)
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (let i = startIndex; i < data.length; i++) {
        if (data[i].low < minPrice) minPrice = data[i].low;
        if (data[i].high > maxPrice) maxPrice = data[i].high;
    }

    const numBins = 50;
    const binSize = (maxPrice - minPrice) / numBins;
    if (binSize === 0) return { support: [], resistance: [] };

    const bins = new Array(numBins).fill(0);

    for (let i = startIndex; i < data.length; i++) {
        const candle = data[i];
        const vol = candle.volume || 1; // Fallback to 1 if no volume

        const startBin = Math.max(0, Math.floor((candle.low - minPrice) / binSize));
        const endBin = Math.min(numBins - 1, Math.floor((candle.high - minPrice) / binSize));

        const binsSpanned = endBin - startBin + 1;
        const volPerBin = vol / binsSpanned;

        for (let b = startBin; b <= endBin; b++) {
            bins[b] += volPerBin;
        }
    }

    // Smooth bins
    const smoothedBins = new Array(numBins).fill(0);
    for (let i = 1; i < numBins - 1; i++) {
        smoothedBins[i] = (bins[i - 1] + bins[i] + bins[i + 1]) / 3;
    }
    smoothedBins[0] = bins[0];
    smoothedBins[numBins - 1] = bins[numBins - 1];

    let allLevels = [];

    // Find peaks in smoothed bins
    for (let i = 1; i < numBins - 1; i++) {
        if (smoothedBins[i] > smoothedBins[i - 1] && smoothedBins[i] > smoothedBins[i + 1]) {
            const priceLevel = minPrice + (i * binSize) + (binSize / 2);
            allLevels.push({
                price: priceLevel,
                volume: smoothedBins[i],
                type: 'vwpd'
            });
        }
    }

    // Keep top VWPD levels
    allLevels.sort((a, b) => b.volume - a.volume);
    const topVWPD = allLevels.slice(0, 8);

    // 2. Order Block Detection (Simple)
    const atrArray = calculateATR(data, 14);
    const obLevels = [];

    for (let i = Math.max(1, startIndex); i < data.length - 1; i++) {
        const candle = data[i];
        const prevCandle = data[i - 1];
        const atr = atrArray[i] || ((candle.high - candle.low) / 2);

        const bodySize = Math.abs(candle.close - candle.open);

        // Bullish displacement
        if (candle.close > candle.open && bodySize > atr * 1.5) {
            // Check if prev candle was bearish
            if (prevCandle.close < prevCandle.open) {
                // Bullish OB
                obLevels.push({
                    price: (prevCandle.high + prevCandle.low) / 2, // Middle of the OB
                    type: 'ob',
                    obDirection: 'bullish'
                });
            }
        }
        // Bearish displacement
        else if (candle.close < candle.open && bodySize > atr * 1.5) {
            // Check if prev candle was bullish
            if (prevCandle.close > prevCandle.open) {
                // Bearish OB
                obLevels.push({
                    price: (prevCandle.high + prevCandle.low) / 2,
                    type: 'ob',
                    obDirection: 'bearish'
                });
            }
        }
    }

    // Merge VWPD and OB
    const finalLevels = [];
    const mergedRaw = [...topVWPD, ...obLevels.slice(-6)]; // Last 6 OBs

    // Filter out levels that are too close to each other
    const threshold = 0.003; // merged threshold
    for (const raw of mergedRaw) {
        let matched = false;
        for (const existing of finalLevels) {
            const diff = Math.abs(existing.price - raw.price) / existing.price;
            if (diff < threshold) {
                matched = true;
                existing.touches = (existing.touches || 1) + 1;
                if (raw.type === 'ob') existing.label = existing.price < currentPrice ? 'Bullish OB' : 'Bearish OB'; // Give OB label priority if mixed
                break;
            }
        }
        if (!matched) {
            finalLevels.push({
                ...raw,
                touches: raw.type === 'vwpd' ? 2 : 3, // Treat VWPD/OB as 'strong' by giving touches >= 2
                label: raw.type === 'vwpd' ? 'VWPD Node' : (raw.obDirection === 'bullish' ? 'Demand Zone' : 'Supply Zone'),
                originalType: raw.price < currentPrice ? 'support' : 'resistance'
            });
        }
    }

    const support = [];
    const resistance = [];

    finalLevels.forEach(level => {
        const isStrong = level.touches >= 2;
        const isFlipped = false; // Simplified

        const outputLevel = {
            ...level,
            isFlipped,
            isStrong,
            label: level.label
        };

        if (level.price < currentPrice) {
            support.push(outputLevel);
        } else {
            resistance.push(outputLevel);
        }
    });

    // Sort support descending (closest to current price first)
    support.sort((a, b) => b.price - a.price);
    // Sort resistance ascending (closest to current price first)
    resistance.sort((a, b) => a.price - b.price);

    return {
        support: support.slice(0, 6),
        resistance: resistance.slice(0, 6)
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
