# UI/UX best practices

## Presenting an algorithmic buy/sell/hold-style signal

A label like "Buy" or "Sell" reads as advice even when it's just a rule-based
heuristic over price data. To keep it honest:

- **Always show the inputs that produced the label, next to the label.**
  Never render a bare "Buy"/"Sell"/"Hold" chip with no breakdown — show
  which indicators fired and in which direction, so the user can judge the
  reasoning instead of trusting a black box.
- **Carry a visible disclaimer wherever the label appears**, not just once
  in a footer — this is a heuristic over historical price data, not
  investment advice, and it should say so every time it's shown.
- **Avoid false precision.** Don't render a signal as a single confident
  word without also showing its confidence/strength (e.g. how many of the
  underlying indicators agree) — a 1-of-2 lean and a 2-of-2 lean are
  different claims and should look different.
- **Degrade visibly, not silently, on thin data.** If there isn't enough
  price history to compute an indicator, show that explicitly ("not enough
  history for a 200-day trend") rather than omitting the indicator from the
  score without explanation.

## Auth-gated pages

- **Guard routes, not components.** Put the auth check at the router level
  (a wrapper route/element) so an unauthenticated user is redirected before
  any gated page's data-fetching effects run — don't rely on each page
  individually checking auth state, which is easy to forget on a new page.
- **Preserve intended destination through login.** Redirecting to `/login`
  should remember where the user was headed and return them there after
  sign-in, rather than always dropping them on the home page.
