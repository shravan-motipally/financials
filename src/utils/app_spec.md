# Financials Specification

## Polygon IO API Specification

- This application uses Polygon IO APIs to pull financial data for tickers. The API reference can be found here: https://polygon.io/docs

## Financials Home Page

- THe financials home page consists of a list of tickers along with a search bar that let's the user search for a specific ticker or a ticker's full name.
- Use the tickers API to search for a specific ticker - rather than using the tickers.json from the data folder. API: "https://api.polygon.io/v3/reference/tickers?market=stocks&search={search_term}&active=true&order=asc&limit=100&sort=ticker&apiKey=YOUR_API_KEY". THe expected response is:

```json
{
  "count": 1,
  "next_url": "https://api.polygon.io/v3/reference/tickers?cursor=<cursor>",
  "request_id": "e70013d92930de90e089dc8fa098888e",
  "results": [
    {
      "active": true,
      "cik": "0001090872",
      "composite_figi": "BBG000BWQYZ5",
      "currency_name": "usd",
      "last_updated_utc": "2021-04-25T00:00:00Z",
      "locale": "us",
      "market": "stocks",
      "name": "Agilent Technologies Inc.",
      "primary_exchange": "XNYS",
      "share_class_figi": "BBG001SCTQY4",
      "ticker": "A",
      "type": "CS"
    }
  ],
  "status": "OK"
}
```

### Ticker Page

- Upon clicking on a specific ticker card, a call is made to polygon io with a call to the tickers details API: "https://api.polygon.io/v3/reference/tickers/{ticker}?apiKey=YOUR_API_KEY" with the ticker in the url and the api key as the query parameter. The expected response is:

```json
{
  "request_id": "31d59dda-80e5-4721-8496-d0d32a654afe",
  "results": {
    "active": true,
    "address": {
      "address1": "One Apple Park Way",
      "city": "Cupertino",
      "postal_code": "95014",
      "state": "CA"
    },
    "branding": {
      "icon_url": "https://api.polygon.io/v1/reference/company-branding/d3d3LmFwcGxlLmNvbQ/images/2022-01-10_icon.png",
      "logo_url": "https://api.polygon.io/v1/reference/company-branding/d3d3LmFwcGxlLmNvbQ/images/2022-01-10_logo.svg"
    },
    "cik": "0000320193",
    "composite_figi": "BBG000B9XRY4",
    "currency_name": "usd",
    "description": "Apple designs a wide variety of consumer electronic devices, including smartphones (iPhone), tablets (iPad), PCs (Mac), smartwatches (Apple Watch), AirPods, and TV boxes (Apple TV), among others. The iPhone makes up the majority of Apple's total revenue. In addition, Apple offers its customers a variety of services such as Apple Music, iCloud, Apple Care, Apple TV+, Apple Arcade, Apple Card, and Apple Pay, among others. Apple's products run internally developed software and semiconductors, and the firm is well known for its integration of hardware, software and services. Apple's products are distributed online as well as through company-owned stores and third-party retailers. The company generates roughly 40% of its revenue from the Americas, with the remainder earned internationally.",
    "homepage_url": "https://www.apple.com",
    "list_date": "1980-12-12",
    "locale": "us",
    "market": "stocks",
    "market_cap": 2771126040150,
    "name": "Apple Inc.",
    "phone_number": "(408) 996-1010",
    "primary_exchange": "XNAS",
    "round_lot": 100,
    "share_class_figi": "BBG001S5N8V8",
    "share_class_shares_outstanding": 16406400000,
    "sic_code": "3571",
    "sic_description": "ELECTRONIC COMPUTERS",
    "ticker": "AAPL",
    "ticker_root": "AAPL",
    "total_employees": 154000,
    "type": "CS",
    "weighted_shares_outstanding": 16334371000
  },
  "status": "OK"
}
```

- Another call (upon clicking the card) is made to the news api url as such: "https://api.polygon.io/v2/reference/news?ticker={ticker}&order=asc&limit=10&sort=published_utc&apiKey=YOUR_API_KEY". The expected response is:

```json
{
  "count": 1,
  "next_url": "https://api.polygon.io:443/v2/reference/news?cursor=<cursor>>",
  "request_id": "831afdb0b8078549fed053476984947a",
  "results": [
    {
      "amp_url": "https://m.uk.investing.com/news/stock-market-news/markets-are-underestimating-fed-cuts-ubs-3559968?ampMode=1",
      "article_url": "https://uk.investing.com/news/stock-market-news/markets-are-underestimating-fed-cuts-ubs-3559968",
      "author": "Sam Boughedda",
      "description": "UBS analysts warn that markets are underestimating the extent of future interest rate cuts by the Federal Reserve, as the weakening economy is likely to justify more cuts than currently anticipated.",
      "id": "8ec638777ca03b553ae516761c2a22ba2fdd2f37befae3ab6fdab74e9e5193eb",
      "image_url": "https://i-invdn-com.investing.com/news/LYNXNPEC4I0AL_L.jpg",
      "insights": [
        {
          "sentiment": "positive",
          "sentiment_reasoning": "UBS analysts are providing a bullish outlook on the extent of future Federal Reserve rate cuts, suggesting that markets are underestimating the number of cuts that will occur.",
          "ticker": "UBS"
        }
      ],
      "keywords": ["Federal Reserve", "interest rates", "economic data"],
      "published_utc": "2024-06-24T18:33:53Z",
      "publisher": {
        "favicon_url": "https://s3.polygon.io/public/assets/news/favicons/investing.ico",
        "homepage_url": "https://www.investing.com/",
        "logo_url": "https://s3.polygon.io/public/assets/news/logos/investing.png",
        "name": "Investing.com"
      },
      "tickers": ["UBS"],
      "title": "Markets are underestimating Fed cuts: UBS By Investing.com - Investing.com UK"
    }
  ],
  "status": "OK"
}
```

- Another call (upon clicking the card) is made to the related tickers api - with url such as "https://api.polygon.io/v1/related-companies/{ticker}?apiKey=YOUR_API_KEY". The expected response is:

```json
{
  "request_id": "31d59dda-80e5-4721-8496-d0d32a654afe",
  "results": [
    {
      "ticker": "MSFT"
    },
    {
      "ticker": "GOOGL"
    },
    {
      "ticker": "AMZN"
    }
  ],
  "status": "OK",
  "stock_symbol": "AAPL"
}
```

- Except for the first call, where we call the tickers detail api, show all the details for related tickers, news for the specific ticker and description for the ticker (from the ticker details api).
- Keep the related tickers clickable so that on click, a user can go to that specific ticker page.

## Implementation Task Table

| Task                                                      | Warnings                                                    | Status      |
| --------------------------------------------------------- | ----------------------------------------------------------- | ----------- |
| 1. Setup routing system (React Router)                    | Need to install react-router-dom if not present             | ✅ Complete |
| 2. Create environment configuration for Polygon API key   | API key should be stored securely in .env file              | ✅ Complete |
| 3. Update existing TickerSearch to be home page component | Current component needs click handlers for navigation       | ✅ Complete |
| 4. Create TickerDetail page component                     | Complex component with multiple API calls and data display  | ✅ Complete |
| 5. Implement Polygon API service functions                | Need error handling for API failures and rate limiting      | ✅ Complete |
| 6. Create ticker details API integration                  | Requires API key validation and proper error handling       | ✅ Complete |
| 7. Create news API integration                            | News data can be large, need pagination handling            | ✅ Complete |
| 8. Create related companies API integration               | Related companies may not exist for all tickers             | ✅ Complete |
| 9. Design and implement TickerDetail UI layout            | Complex layout with multiple sections and responsive design | ✅ Complete |
| 10. Add navigation between ticker pages                   | Need proper URL structure and back navigation               | ✅ Complete |
| 11. Implement loading states and error handling           | Critical for good UX during API calls                       | ⏳ Pending  |
| 12. Add responsive design for mobile devices              | Ensure all components work on different screen sizes        | ⏳ Pending  |
| 13. Testing and bug fixes                                 | Comprehensive testing of all features and edge cases        | ⏳ Pending  |

## Live Search Implementation Tasks

| Task                                      | Warnings                                                       | Status      |
| ----------------------------------------- | -------------------------------------------------------------- | ----------- |
| 14. Fix current linting errors            | Clean up unused imports and variables                          | ✅ Complete |
| 15. Add ticker search API function        | Rate limiting concerns, need proper error handling             | ✅ Complete |
| 16. Update search component for API usage | Remove local JSON dependency, implement enter-key search       | ✅ Complete |
| 17. Implement search history storage      | Limit to 12 results, use localStorage for persistence          | ✅ Complete |
| 18. Add recently clicked section          | Display below search history when no active search             | ✅ Complete |
| 19. Restructure UI layout                 | History at top, recent results below, proper responsive design | ✅ Complete |

**Legend:** ⏳ Pending | 🔄 In Progress | ✅ Complete | ❌ Blocked
