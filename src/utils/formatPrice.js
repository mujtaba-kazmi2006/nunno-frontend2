/**
 * Smart price formatter for cryptocurrency tokens.
 * Handles everything from BTC ($95,000) to PEPE ($0.0000082).
 * 
 * Rules:
 *  - >= $1,000   → comma-separated, 2 decimals:   $95,230.45
 *  - >= $1       → 2 decimals:                     $0.85  /  $123.45
 *  - >= $0.01    → 4 decimals:                     $0.0134
 *  - >= $0.0001  → 6 decimals:                     $0.000842
 *  - < $0.0001   → up to 8 significant decimals:   $0.00000823
 *
 * @param {number|string} price - The price value
 * @param {object} [opts] - Options
 * @param {boolean} [opts.symbol=true] - Include $ prefix
 * @param {boolean} [opts.compact=false] - Use compact format ($95.2k)
 * @returns {string} Formatted price string
 */
export function formatPrice(price, opts = {}) {
    const { symbol = true, compact = false } = opts;
    const num = Number(price);
    const prefix = symbol ? '$' : '';

    if (num == null || isNaN(num)) return `${prefix}0.00`;

    // Compact mode (for mini widgets)
    if (compact) {
        if (num >= 1_000_000) return `${prefix}${(num / 1_000_000).toFixed(2)}M`;
        if (num >= 1_000) return `${prefix}${(num / 1_000).toFixed(1)}k`;
    }

    // Standard formatting based on magnitude
    if (num >= 1_000) {
        return `${prefix}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (num >= 1) {
        return `${prefix}${num.toFixed(2)}`;
    }
    if (num >= 0.01) {
        return `${prefix}${num.toFixed(4)}`;
    }
    if (num >= 0.0001) {
        return `${prefix}${num.toFixed(6)}`;
    }

    // Very small prices (meme coins) — show up to 8 significant digits
    if (num > 0) {
        // Find how many leading zeros after decimal
        const str = num.toFixed(20);
        const match = str.match(/^0\.0*/);
        const leadingZeros = match ? match[0].length - 2 : 0; // subtract "0."
        const sigDigits = Math.min(leadingZeros + 4, 12); // show 4 significant digits after zeros
        return `${prefix}${num.toFixed(sigDigits)}`;
    }

    // Zero or negative (edge case)
    if (num === 0) return `${prefix}0.00`;
    // Negative prices (shouldn't happen but handle gracefully)
    return `${prefix}${num.toFixed(2)}`;
}

/**
 * Format price for chart axis ticks (shorter, no $ prefix option)
 */
export function formatTickPrice(price) {
    const num = Number(price);
    if (num == null || isNaN(num)) return '';
    if (num >= 1_000) return `$${num.toLocaleString()}`;
    if (num >= 1) return `$${num.toFixed(2)}`;
    if (num >= 0.01) return `$${num.toFixed(4)}`;
    if (num >= 0.0001) return `$${num.toFixed(6)}`;
    if (num > 0) {
        const str = num.toFixed(20);
        const match = str.match(/^0\.0*/);
        const leadingZeros = match ? match[0].length - 2 : 0;
        return `$${num.toFixed(Math.min(leadingZeros + 3, 10))}`;
    }
    return '$0.00';
}
