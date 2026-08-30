# Data layer best practices

## Working with a free-tier market data API (Polygon.io)

The free/Basic plan is 5 calls/min, end-of-day (or 15-min-delayed) data only.
That budget is shared by every feature on a page, so:

- **Batch and stagger requests per page**, not per component. `TickerDetail`
  already staggers its three calls with `setTimeout`; any new fetch on that
  page must slot into the same budget rather than firing independently.
- **Reuse data already fetched on the page instead of issuing a new call.**
  E.g. a feature that needs daily closes should reuse the same
  `getAggregateData` response window other features on the page use, rather
  than each requesting its own date range.
- **Fail closed, not silently.** If a computation needs N data points and the
  API returns fewer (rate-limited, thin history, delisted ticker), surface
  "insufficient data" in the result rather than computing on a partial
  window and presenting it as normal.
- **Never call a paid-tier-only endpoint from the free-tier assumption.**
  Verify which reference/fundamentals endpoints are actually included on the
  Basic plan before depending on them (e.g. `vX/reference/financials` is not
  reliably available on Basic) — the API layer best-practices guide covers
  how to isolate the API key so this can be re-verified via a proxy without
  redeploying the frontend.

## Computing technical indicators from OHLC series

- **State the lookback window a metric needs, and refuse to compute it
  short.** A 200-day SMA on 90 days of history isn't a shorter SMA, it's a
  different, misleading number — return "insufficient data" instead of a
  partial average.
- **Don't look ahead.** Indicators must only use data up to and including
  the day being evaluated; never let a rolling calculation reach into future
  bars (this is a correctness bug in indicator code, not just a style
  preference — it silently makes backtests look better than reality).
- **Use the standard formula, not a simplified approximation, once you
  claim the indicator's name.** E.g. RSI should use Wilder's smoothing, not
  a naive rolling average — calling something "RSI(14)" implies the
  standard definition.
- **Keep indicator functions pure** (`(values) => number`, no fetching, no
  React state) so they're unit-testable without an API key or mocked
  network calls.
