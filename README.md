# Financials

A React + TypeScript web app for looking up stock tickers and viewing company
details, news, and related companies, powered by the [Polygon.io](https://polygon.io/docs)
market data API.

## What it does

- **Search** — Look up stocks/ETFs by ticker symbol or company name using
  Polygon's live ticker search API. Search history and recently viewed
  tickers are cached in `localStorage` and shown on the home page.
- **Ticker detail page** (`/ticker/:symbol`) — Clicking a search result loads:
  - Company details (description, exchange, market cap, employees, etc.)
  - Recent news for that ticker
  - Related companies, which are themselves clickable and link to their own
    ticker detail page
- **API test runner** (`/test-api`) — A small in-app page for sanity-checking
  that the Polygon API integration and API key are working.

See `src/utils/app_spec.md` for the original feature spec, including sample
Polygon API request/response shapes.

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/), bootstrapped with `react-scripts` (Create React App)
- [React Router](https://reactrouter.com/) for client-side routing
- [MUI (Material UI)](https://mui.com/) for components/theming, plus `@mui/x-charts` for charts
- [Axios](https://axios-http.com/) for HTTP calls to the Polygon.io API
- [Recharts](https://recharts.org/) for additional charting

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your Polygon.io API key

The app needs a Polygon.io API key to fetch live data. Create a `.env` file
in the project root:

```env
REACT_APP_POLYGONIO_KEY=your_actual_api_key_here
```

See [POLYGON_API_SETUP.md](./POLYGON_API_SETUP.md) for a full walkthrough
(getting a free key, verifying it's picked up, endpoint/rate-limit info).
`.env` is git-ignored — never commit real API keys.

### 3. Run the dev server

```bash
npm start
```

Opens the app at [http://localhost:3000](http://localhost:3000).

## Available scripts

| Script                  | Description                                             |
| ------------------------ | -------------------------------------------------------- |
| `npm start`              | Run the app in development mode                          |
| `npm run build`          | Build a production bundle to `build/`                    |
| `npm test`               | Run tests in watch mode                                  |
| `npm run lint`           | Lint `src/` with ESLint                                  |
| `npm run lint:fix`       | Lint and auto-fix                                        |
| `npm run format`         | Format source files with Prettier                        |
| `npm run format:check`   | Check formatting without writing changes                 |
| `npm run type-check`     | Run the TypeScript compiler without emitting output       |
| `npm run secret-scan`    | Scan the repo for leaked secrets with Gitleaks            |
| `npm run deploy`         | Build and publish `build/` to GitHub Pages                |

## Project structure

```
src/
├── api/
│   └── polygon-io-api.ts     # Polygon.io API client (tickers, news, related companies, financials)
├── components/
│   ├── TickerSearch.tsx      # Home page: search + history + recently viewed
│   ├── TickerDetail.tsx      # Ticker detail page: company info, news, related companies
│   └── ApiTestRunner.tsx     # /test-api page for verifying the API integration
├── dashboard/                # Dashboard UI pieces (title/subtitle widgets)
├── utils/
│   ├── StringConstants.ts    # API base URLs, endpoint builders, env var wiring
│   ├── searchHistory.ts      # localStorage-backed search/recently-viewed history hook
│   ├── navigationHistory.ts  # Navigation history helper
│   └── app_spec.md           # Original feature spec + sample API payloads
├── data/                     # Static sample/fallback JSON data
└── App.tsx                   # Routes: "/", "/ticker/:symbol", "/test-api"
```

## Code quality & git hooks

This repo uses [Husky](https://typicode.github.io/husky/) + [Gitleaks](https://github.com/gitleaks/gitleaks) to run
secret scanning, linting, formatting, and type-checking on every commit.
See [docs/PRE_COMMIT_SETUP.md](./docs/PRE_COMMIT_SETUP.md) for setup
instructions (including installing Gitleaks) and troubleshooting.
