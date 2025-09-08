/**
 * Quick API Test - Console Runner
 *
 * Run this in the browser console to quickly test API functions:
 *
 * 1. Open browser console (F12)
 * 2. Import and run: import('./utils/quickApiTest.js').then(m => m.runQuickTest())
 * 3. Or copy/paste the runQuickTest function directly
 */

import {
  getTickerDetails,
  getTickerNews,
  getRelatedCompanies,
  checkApiHealth,
  PolygonApiError,
} from "../api/polygon-io-api";

export const runQuickTest = async () => {
  console.log("🚀 Quick API Test Starting...");
  console.log("============================");

  const ticker = "AAPL";

  try {
    // Test 1: API Health Check
    console.log("1️⃣ Testing API Health...");
    const health = await checkApiHealth();
    console.log(
      `   Result: ${health ? "✅ API is healthy" : "❌ API health check failed"}`,
    );

    if (!health) {
      console.error(
        "❌ API health check failed. Please check your API key configuration.",
      );
      return;
    }

    // Test 2: Get Ticker Details
    console.log(`\n2️⃣ Testing Ticker Details for ${ticker}...`);
    const details = await getTickerDetails(ticker);
    console.log(`   ✅ Company: ${details.results.name}`);
    console.log(
      `   📄 Description: ${details.results.description?.substring(0, 100)}...`,
    );
    console.log(
      `   🏢 Employees: ${details.results.total_employees?.toLocaleString()}`,
    );
    console.log(
      `   💰 Market Cap: $${(details.results.market_cap / 1e9).toFixed(1)}B`,
    );

    // Test 3: Get News
    console.log(`\n3️⃣ Testing News for ${ticker}...`);
    const news = await getTickerNews(ticker);
    console.log(`   ✅ Found ${news.results.length} news articles`);
    if (news.results.length > 0) {
      console.log(`   📰 Latest: "${news.results[0].title}"`);
      console.log(
        `   🗓️ Published: ${new Date(news.results[0].published_utc).toLocaleDateString()}`,
      );
    }

    // Test 4: Get Related Companies
    console.log(`\n4️⃣ Testing Related Companies for ${ticker}...`);
    const related = await getRelatedCompanies(ticker);
    console.log(`   ✅ Found ${related.results.length} related companies`);
    if (related.results.length > 0) {
      console.log(
        `   🔗 Related tickers: ${related.results.map((r) => r.ticker).join(", ")}`,
      );
    } else {
      console.log(
        `   ℹ️ No related companies found (this is normal for some tickers)`,
      );
    }

    console.log("\n🎉 All tests completed successfully!");
    console.log("✅ Your API integration is working correctly.");
  } catch (error) {
    console.error("\n❌ Test failed with error:", error);

    if (error instanceof PolygonApiError) {
      console.error(`   API Error: ${error.message}`);
      console.error(`   Status: ${error.status}`);

      if (error.status === 401) {
        console.error("   💡 This looks like an API key issue. Please check:");
        console.error(
          "      - Your .env file has REACT_APP_POLYGONIO_KEY=your_key",
        );
        console.error("      - Your API key is valid and active");
        console.error("      - You have restarted the development server");
      }
    } else {
      console.error("   💡 This might be a network or configuration issue.");
    }
  }
};

// Alternative function that returns structured results
export const runQuickTestWithResults = async () => {
  const results = {
    health: false,
    ticker: "AAPL",
    details: null as any,
    news: null as any,
    related: null as any,
    error: null as any,
  };

  try {
    results.health = await checkApiHealth();
    if (results.health) {
      results.details = await getTickerDetails(results.ticker);
      results.news = await getTickerNews(results.ticker);
      results.related = await getRelatedCompanies(results.ticker);
    }
  } catch (error) {
    results.error = error;
  }

  return results;
};

// Console helper for easy testing
if (typeof window !== "undefined") {
  (window as any).testApi = runQuickTest;
  (window as any).testApiWithResults = runQuickTestWithResults;
  console.log("🧪 Quick API test functions loaded!");
  console.log("   - Run: window.testApi() for console output");
  console.log("   - Run: window.testApiWithResults() for structured results");
}

export default runQuickTest;
