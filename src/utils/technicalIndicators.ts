// Pure, dependency-free technical indicator math.
// See docs/best-practices/data-layer.md for the rules these follow
// (no lookahead, no partial-window averages, standard formulas).

export const simpleMovingAverage = (
  values: number[],
  period: number,
): number | null => {
  if (values.length < period) return null;
  const window = values.slice(values.length - period);
  return window.reduce((sum, v) => sum + v, 0) / period;
};

// Wilder's RSI (the standard definition of "RSI(period)").
export const relativeStrengthIndex = (
  closes: number[],
  period: number = 14,
): number | null => {
  if (closes.length < period + 1) return null;

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) avgGain += change;
    else avgLoss += -change;
  }
  avgGain /= period;
  avgLoss /= period;

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
};

export interface PriceRange {
  high: number;
  low: number;
  // 0 = at the low, 1 = at the high
  positionInRange: number;
}

export const priceRange = (
  highs: number[],
  lows: number[],
  currentPrice: number,
): PriceRange | null => {
  if (highs.length === 0 || lows.length === 0) return null;
  const high = Math.max(...highs);
  const low = Math.min(...lows);
  if (high === low) return { high, low, positionInRange: 0.5 };
  const positionInRange = (currentPrice - low) / (high - low);
  return { high, low, positionInRange };
};
