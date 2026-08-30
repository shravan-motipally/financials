// Minimum-viable Buy/Hold/Sell heuristic, computed entirely from free
// end-of-day price data (Polygon's Basic-tier aggregates endpoint).
//
// This is deliberately a rough technical heuristic, NOT investment advice —
// see docs/best-practices/ui-ux.md for how the result must be presented
// (always show the votes that produced it, always show the disclaimer).

import { getAggregateData } from "../api/polygon-io-api";
import {
  simpleMovingAverage,
  relativeStrengthIndex,
  priceRange,
} from "./technicalIndicators";

export type SignalLabel = "BUY" | "HOLD" | "SELL";

export interface IndicatorVote {
  name: string;
  detail: string;
  vote: -1 | 0 | 1; // -1 bearish, 0 neutral, +1 bullish
}

export interface SignalResult {
  label: SignalLabel;
  score: number;
  maxScore: number;
  votes: IndicatorVote[];
  context: string[];
  insufficientData: boolean;
}

const RSI_PERIOD = 14;
const SMA_SHORT = 50;
const SMA_LONG = 200;
// Extra padding beyond SMA_LONG so the SMA itself isn't computed on the
// very first (thinnest) part of the window.
const LOOKBACK_CALENDAR_DAYS = 400;

export const computeSignal = async (ticker: string): Promise<SignalResult> => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - LOOKBACK_CALENDAR_DAYS);

  const data = await getAggregateData(ticker, 1, "day", from, to);
  const results = (data?.results ?? []) as Array<{
    c: number;
    h: number;
    l: number;
  }>;

  const votes: IndicatorVote[] = [];
  const context: string[] = [];

  const closes = results.map((r) => r.c);
  const highs = results.map((r) => r.h);
  const lows = results.map((r) => r.l);
  const currentPrice = closes[closes.length - 1];

  if (closes.length < RSI_PERIOD + 1) {
    return {
      label: "HOLD",
      score: 0,
      maxScore: 0,
      votes: [],
      context: [
        `Only ${closes.length} trading days of history available — not enough to compute any indicator.`,
      ],
      insufficientData: true,
    };
  }

  // SMA50 vs SMA200 crossover (trend)
  const sma50 = simpleMovingAverage(closes, SMA_SHORT);
  const sma200 = simpleMovingAverage(closes, SMA_LONG);
  if (sma50 !== null && sma200 !== null) {
    const bullish = sma50 > sma200;
    votes.push({
      name: "Trend (50d vs 200d moving average)",
      detail: `${bullish ? "Golden cross" : "Death cross"}: 50d SMA $${sma50.toFixed(2)} ${bullish ? ">" : "<"} 200d SMA $${sma200.toFixed(2)}`,
      vote: bullish ? 1 : -1,
    });
  } else {
    context.push(
      `Not enough history for a 200-day trend read (need ${SMA_LONG} daily closes, have ${closes.length}).`,
    );
  }

  // RSI(14) overbought/oversold
  const rsi = relativeStrengthIndex(closes, RSI_PERIOD);
  if (rsi !== null) {
    let vote: -1 | 0 | 1 = 0;
    let detail = `RSI(14) = ${rsi.toFixed(1)}, neutral range`;
    if (rsi > 70) {
      vote = -1;
      detail = `RSI(14) = ${rsi.toFixed(1)}, overbought`;
    } else if (rsi < 30) {
      vote = 1;
      detail = `RSI(14) = ${rsi.toFixed(1)}, oversold`;
    }
    votes.push({ name: "Momentum (RSI-14)", detail, vote });
  }

  // 52-week range — informational context only, not a vote (direction is
  // ambiguous: near-high can mean strength or exhaustion).
  const range = priceRange(highs, lows, currentPrice);
  if (range) {
    const pct = (range.positionInRange * 100).toFixed(0);
    context.push(
      `Trading at ${pct}% of its ${closes.length >= 252 ? "52-week" : `${closes.length}-day`} range ($${range.low.toFixed(2)}–$${range.high.toFixed(2)}).`,
    );
  }

  const score = votes.reduce((sum, v) => sum + v.vote, 0);
  const maxScore = votes.length;
  const label: SignalLabel = score > 0 ? "BUY" : score < 0 ? "SELL" : "HOLD";

  return {
    label,
    score,
    maxScore,
    votes,
    context,
    insufficientData: maxScore === 0,
  };
};
