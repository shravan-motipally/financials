import {
  simpleMovingAverage,
  relativeStrengthIndex,
  priceRange,
} from "./technicalIndicators";

describe("simpleMovingAverage", () => {
  it("returns null when there isn't enough history", () => {
    expect(simpleMovingAverage([1, 2, 3], 5)).toBeNull();
  });

  it("averages exactly the trailing window", () => {
    expect(simpleMovingAverage([1, 2, 3, 4, 5], 3)).toBeCloseTo(4); // (3+4+5)/3
  });
});

describe("relativeStrengthIndex", () => {
  it("returns null when there isn't enough history", () => {
    expect(relativeStrengthIndex([1, 2, 3], 14)).toBeNull();
  });

  it("returns 100 for a strictly increasing series (no losses)", () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 + i);
    expect(relativeStrengthIndex(closes, 14)).toBe(100);
  });

  it("returns 0 for a strictly decreasing series (no gains)", () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 - i);
    expect(relativeStrengthIndex(closes, 14)).toBe(0);
  });

  it("returns a mid-range value for a flat series", () => {
    const closes = Array(20).fill(100);
    // avgGain = avgLoss = 0 -> guarded to 100 (no losses at all)
    expect(relativeStrengthIndex(closes, 14)).toBe(100);
  });
});

describe("priceRange", () => {
  it("returns null with no data", () => {
    expect(priceRange([], [], 100)).toBeNull();
  });

  it("computes position within the high/low range", () => {
    const result = priceRange([110, 120], [90, 95], 105);
    expect(result).not.toBeNull();
    expect(result!.high).toBe(120);
    expect(result!.low).toBe(90);
    expect(result!.positionInRange).toBeCloseTo((105 - 90) / (120 - 90));
  });

  it("treats a flat range as the midpoint", () => {
    const result = priceRange([100], [100], 100);
    expect(result!.positionInRange).toBe(0.5);
  });
});
