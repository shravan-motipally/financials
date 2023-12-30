// DO NOT EVER PUSH SECRETS TO GIT
// export const API_TOKEN = process.env.REACT_APP_ALPHAVANTAGE_KEY;

export type Timespan = "minute" | "day"
const formattedDate = (date: Date) => {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - (offset*60*1000)).toISOString().split('T')[0]
}

export const API_TOKEN = process.env.REACT_APP_POLYGONIO_KEY;
export const APPLICATION_JSON = 'application/json';
export const getAggregateDataUrl = (ticker: string, multiplier: number, timespan: Timespan, from: Date, to: Date) =>
  `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${formattedDate(from)}/${formattedDate(to)}?adjusted=true&sort=asc&limit=5000`

export const getTickerDataUrl = (search: string) =>
  `https://api.polygon.io/v3/reference/tickers?search=${search}&active=true`
