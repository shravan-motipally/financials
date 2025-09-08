import axios from "axios";
import {
  APPLICATION_JSON,
  getAggregateDataUrl,
  getAllTickersUrl,
  getFinancialDataUrl,
  getTickerDataUrl,
  Timespan,
  API_TOKEN,
} from "../utils/StringConstants";

// Type definitions for Polygon API responses

// Aggregate data response interface
export interface AggregateDataResponse {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: Array<{
    c: number; // close
    o: number; // open
    h: number; // high
    l: number; // low
    v: number; // volume
    vw: number; // volume weighted average
    t: number; // timestamp
  }>;
}

// Ticker search response interface
export interface TickerSearchResponse {
  results: Array<{
    ticker: string;
    name: string;
    market: string;
    locale: string;
    primary_exchange?: string;
    type: string;
    active: boolean;
    currency_name: string;
    cik?: string;
    composite_figi?: string;
    share_class_figi?: string;
    last_updated_utc: string;
  }>;
}

export interface TickerDetailsResponse {
  request_id: string;
  results: {
    active: boolean;
    address?: {
      address1: string;
      city: string;
      postal_code: string;
      state: string;
    };
    branding?: {
      icon_url: string;
      logo_url: string;
    };
    cik: string;
    composite_figi: string;
    currency_name: string;
    description: string;
    homepage_url: string;
    list_date: string;
    locale: string;
    market: string;
    market_cap: number;
    name: string;
    phone_number: string;
    primary_exchange: string;
    round_lot: number;
    share_class_figi: string;
    share_class_shares_outstanding: number;
    sic_code: string;
    sic_description: string;
    ticker: string;
    ticker_root: string;
    total_employees: number;
    type: string;
    weighted_shares_outstanding: number;
  };
  status: string;
}

// Ticker Search interfaces
export interface TickerSearchItem {
  active: boolean;
  cik?: string;
  composite_figi?: string;
  currency_name?: string;
  last_updated_utc?: string;
  locale: string;
  market: string;
  name: string;
  primary_exchange?: string;
  share_class_figi?: string;
  ticker: string;
  type: string;
}

export interface PolygonTickerSearchResponse {
  status: string;
  request_id: string;
  count: number;
  next_url?: string;
  results: TickerSearchItem[];
}

export interface NewsArticle {
  amp_url: string;
  article_url: string;
  author: string;
  description: string;
  id: string;
  image_url: string;
  insights?: Array<{
    sentiment: string;
    sentiment_reasoning: string;
    ticker: string;
  }>;
  keywords: string[];
  published_utc: string;
  publisher: {
    favicon_url: string;
    homepage_url: string;
    logo_url: string;
    name: string;
  };
  tickers: string[];
  title: string;
}

export interface NewsResponse {
  count: number;
  next_url?: string;
  request_id: string;
  results: NewsArticle[];
  status: string;
}

export interface RelatedCompaniesResponse {
  request_id: string;
  results: Array<{
    ticker: string;
  }>;
  status: string;
  stock_symbol: string;
}

// API Error class
export class PolygonApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any,
  ) {
    super(message);
    this.name = "PolygonApiError";
  }
}

// Helper function to make API requests with consistent error handling
const makePolygonRequest = async <T = any>(
  url: string,
  errorContext: string,
): Promise<T> => {
  if (!API_TOKEN) {
    throw new PolygonApiError(
      "Polygon API key not configured. Please check your .env file for REACT_APP_POLYGONIO_KEY.",
      401,
    );
  }

  console.log(
    `🌐 Making ${errorContext} request to:`,
    url.replace(API_TOKEN, "[API_KEY]"),
  );

  try {
    const res = await axios({
      timeout: 300000,
      url: url,
      method: "GET",
      headers: {
        Authorization: "Bearer " + API_TOKEN,
        "Content-Type": APPLICATION_JSON,
      },
    });

    return res.data;
  } catch (err: any) {
    let errString = `${errorContext} failed: ${err.message || err}`;
    console.error(errString);

    throw new PolygonApiError(
      errString,
      err.response?.status || 0,
      err.response?.data || err,
    );
  }
};

export const getAggregateData = async (
  ticker: string,
  multiplier: number,
  timespan: Timespan,
  from: Date,
  to: Date,
): Promise<any> => {
  try {
    const url = getAggregateDataUrl(ticker, multiplier, timespan, from, to);
    return await makePolygonRequest(url, "Aggregate data");
  } catch (err) {
    console.error("getAggregateData error:", err);
    return {
      ticker: ticker,
      queryCount: 0,
      resultsCount: 0,
      adjusted: true,
      results: [],
    };
  }
};

export const getTickerData = async (search: string): Promise<any> => {
  try {
    const url = getTickerDataUrl(search);
    return await makePolygonRequest(url, "Ticker search");
  } catch (err) {
    console.error("getTickerData error:", err);
    return { results: [] };
  }
};

export const getAllTickerData = async (): Promise<any> => {
  try {
    const url = getAllTickersUrl();
    return await makePolygonRequest(url, "All tickers");
  } catch (err) {
    console.error("getAllTickerData error:", err);
    return { results: [] };
  }
};

export const getFinancials = async (ticker: string): Promise<any> => {
  try {
    const url = getFinancialDataUrl(ticker);
    return await makePolygonRequest(url, "Financial data");
  } catch (err) {
    console.error("getFinancials error:", err);
    return { results: [] };
  }
};

// NEW API FUNCTIONS FOR TICKER DETAILS PAGE

// Get detailed ticker information
export const getTickerDetails = async (
  ticker: string,
): Promise<TickerDetailsResponse> => {
  try {
    const url = `https://api.polygon.io/v3/reference/tickers/${ticker.toUpperCase()}?apikey=${API_TOKEN}`;
    return await makePolygonRequest<TickerDetailsResponse>(
      url,
      "Ticker details",
    );
  } catch (err) {
    console.error("getTickerDetails error:", err);
    throw err;
  }
};

// Search for tickers using the Polygon API
export const searchTickers = async (
  searchTerm: string,
): Promise<PolygonTickerSearchResponse> => {
  try {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const url = `https://api.polygon.io/v3/reference/tickers?market=stocks&search=${encodedSearchTerm}&active=true&order=asc&limit=100&sort=ticker&apikey=${API_TOKEN}`;
    return await makePolygonRequest<PolygonTickerSearchResponse>(
      url,
      "Ticker search",
    );
  } catch (err) {
    console.error("searchTickers error:", err);
    throw err;
  }
};

// Get news for a specific ticker
export const getTickerNews = async (ticker: string): Promise<NewsResponse> => {
  try {
    const url = `https://api.polygon.io/v2/reference/news?ticker=${ticker.toUpperCase()}&order=desc&limit=10&sort=published_utc&apikey=${API_TOKEN}`;
    return await makePolygonRequest<NewsResponse>(url, "Ticker news");
  } catch (err) {
    console.error("getTickerNews error:", err);
    throw err;
  }
};

// Get related companies for a ticker
export const getRelatedCompanies = async (
  ticker: string,
): Promise<RelatedCompaniesResponse> => {
  try {
    const url = `https://api.polygon.io/v1/related-companies/${ticker.toUpperCase()}?apikey=${API_TOKEN}`;
    return await makePolygonRequest<RelatedCompaniesResponse>(
      url,
      "Related companies",
    );
  } catch (err) {
    console.error("getRelatedCompanies error:", err);
    throw err;
  }
};

// Health check function to test API connectivity
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await getTickerDetails("AAPL");
    console.log("✅ Polygon API health check passed");
    return true;
  } catch (error) {
    console.error("❌ Polygon API health check failed:", error);
    return false;
  }
};
