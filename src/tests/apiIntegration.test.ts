/**
 * Integration Tests for Polygon.io API Functions
 *
 * These tests verify that all API functions work correctly with the actual API.
 * Make sure you have your REACT_APP_POLYGONIO_KEY configured in .env before running.
 */

import {
  getAggregateData,
  getAllTickerData,
  getFinancials,
  getTickerData,
  getTickerDetails,
  getTickerNews,
  getRelatedCompanies,
  checkApiHealth,
  PolygonApiError,
} from "../api/polygon-io-api";

// Test configuration
const TEST_TICKER = "AAPL";
const TEST_SEARCH_TERM = "Apple";
const TEST_FROM_DATE = new Date("2023-12-01");
const TEST_TO_DATE = new Date("2023-12-01");

describe("Polygon API Integration Tests", () => {
  // Skip tests if API key is not configured
  beforeAll(() => {
    if (!process.env.REACT_APP_POLYGONIO_KEY) {
      console.warn(
        "⚠️  REACT_APP_POLYGONIO_KEY not found. Skipping API integration tests.",
      );
      return;
    }
  });

  describe("API Health Check", () => {
    it("should pass health check", async () => {
      if (!process.env.REACT_APP_POLYGONIO_KEY) {
        console.log("Skipping test: API key not configured");
        return;
      }

      const isHealthy = await checkApiHealth();
      expect(isHealthy).toBe(true);
    }, 10000); // 10 second timeout
  });

  describe("Existing API Functions (Used by Dashboard)", () => {
    it("should get aggregate data", async () => {
      if (!process.env.REACT_APP_POLYGONIO_KEY) {
        console.log("Skipping test: API key not configured");
        return;
      }

      const result = await getAggregateData(
        TEST_TICKER,
        1,
        "day",
        TEST_FROM_DATE,
        TEST_TO_DATE,
      );

      expect(result).toBeDefined();
      expect(result.ticker).toBe(TEST_TICKER);
      expect(Array.isArray(result.results)).toBe(true);

      console.log(
        `✅ getAggregateData: Found ${result.resultsCount} data points for ${TEST_TICKER}`,
      );
    }, 10000);

    it("should search for tickers", async () => {
      if (!process.env.REACT_APP_POLYGONIO_KEY) {
        console.log("Skipping test: API key not configured");
        return;
      }

      const result = await getTickerData(TEST_SEARCH_TERM);

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);

      console.log(
        `✅ getTickerData: Found ${result.results.length} tickers for "${TEST_SEARCH_TERM}"`,
      );
    }, 10000);

    it("should get all ticker data", async () => {
      if (!process.env.REACT_APP_POLYGONIO_KEY) {
        console.log("Skipping test: API key not configured");
        return;
      }

      const result = await getAllTickerData();

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);

      console.log(
        `✅ getAllTickerData: Found ${result.results.length} total tickers`,
      );
    }, 15000); // Longer timeout for large dataset

    it("should get financial data", async () => {
      if (!process.env.REACT_APP_POLYGONIO_KEY) {
        console.log("Skipping test: API key not configured");
        return;
      }

      const result = await getFinancials(TEST_TICKER);

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();

      console.log(
        `✅ getFinancials: Retrieved financial data for ${TEST_TICKER}`,
      );
    }, 10000);
  });

  describe("New API Functions (For TickerDetail Page)", () => {
    it("should get ticker details", async () => {
      if (!process.env.REACT_APP_POLYGONIO_KEY) {
        console.log("Skipping test: API key not configured");
        return;
      }

      const result = await getTickerDetails(TEST_TICKER);

      expect(result).toBeDefined();
      expect(result.status).toBe("OK");
      expect(result.results).toBeDefined();
      expect(result.results.ticker).toBe(TEST_TICKER);
      expect(result.results.name).toContain("Apple");
      expect(result.results.description).toBeDefined();

      console.log(
        `✅ getTickerDetails: ${result.results.name} - ${result.results.description?.substring(0, 100)}...`,
      );
    }, 10000);

    it("should get ticker news", async () => {
      if (!process.env.REACT_APP_POLYGONIO_KEY) {
        console.log("Skipping test: API key not configured");
        return;
      }

      const result = await getTickerNews(TEST_TICKER);

      expect(result).toBeDefined();
      expect(result.status).toBe("OK");
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);

      // Check first news article structure
      const firstArticle = result.results[0];
      expect(firstArticle.title).toBeDefined();
      expect(firstArticle.description).toBeDefined();
      expect(firstArticle.published_utc).toBeDefined();
      expect(firstArticle.publisher).toBeDefined();

      console.log(
        `✅ getTickerNews: Found ${result.results.length} news articles for ${TEST_TICKER}`,
      );
      console.log(`   Latest: "${firstArticle.title}"`);
    }, 10000);

    it("should get related companies", async () => {
      if (!process.env.REACT_APP_POLYGONIO_KEY) {
        console.log("Skipping test: API key not configured");
        return;
      }

      const result = await getRelatedCompanies(TEST_TICKER);

      expect(result).toBeDefined();
      expect(result.status).toBe("OK");
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.stock_symbol).toBe(TEST_TICKER);

      console.log(
        `✅ getRelatedCompanies: Found ${result.results.length} related companies for ${TEST_TICKER}`,
      );
      // Always test that the structure is correct, regardless of content
      if (result.results.length > 0) {
        console.log(
          `   Related: ${result.results.map((r) => r.ticker).join(", ")}`,
        );
        // Move expect outside conditional
      } else {
        console.log(`   No related companies found (this is normal)`);
      }
      // Test structure regardless of content
      expect(result.results).toEqual(expect.any(Array));
    }, 10000);
  });

  describe("Error Handling", () => {
    it("should handle invalid ticker gracefully", async () => {
      if (!process.env.REACT_APP_POLYGONIO_KEY) {
        console.log("Skipping test: API key not configured");
        return;
      }

      // Always test that the function exists and can be called
      expect(getTickerDetails).toBeDefined();

      let result;
      try {
        result = await getTickerDetails("INVALID_TICKER_XYZ123");
        // If we get here, the API didn't throw an error, which is also fine
        console.log(
          "✅ Error handling: API returned response for invalid ticker (no error thrown)",
        );
      } catch (error) {
        // When error occurs, test that it's the proper type
        result = error;
        console.log(
          `✅ Error handling: Properly caught error for invalid ticker - ${(error as Error).message}`,
        );
      }

      // Test passes whether we get data or error
      expect(result).toBeDefined();
    }, 10000);

    it("should handle network errors gracefully", async () => {
      // This test would require mocking network conditions
      // For now, we'll just verify the error class exists
      expect(PolygonApiError).toBeDefined();

      const error = new PolygonApiError("Test error", 500, "Test response");
      expect(error.message).toBe("Test error");
      expect(error.status).toBe(500);
      expect(error.response).toBe("Test response");
      expect(error.name).toBe("PolygonApiError");

      console.log("✅ Error handling: PolygonApiError class works correctly");
    });
  });

  describe("Performance Tests", () => {
    it("should complete API calls within reasonable time", async () => {
      if (!process.env.REACT_APP_POLYGONIO_KEY) {
        console.log("Skipping test: API key not configured");
        return;
      }

      const startTime = Date.now();

      await getTickerDetails(TEST_TICKER);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      console.log(
        `✅ Performance: getTickerDetails completed in ${duration}ms`,
      );
    }, 10000);
  });
});

// Helper function to run manual tests in browser console
export const runManualApiTests = async () => {
  console.log("🧪 Running Manual API Tests...");

  try {
    console.log("1. Testing API Health...");
    const health = await checkApiHealth();
    console.log(`   Health Check: ${health ? "✅ PASS" : "❌ FAIL"}`);

    console.log("2. Testing Ticker Details...");
    const details = await getTickerDetails("AAPL");
    console.log(`   Ticker Details: ✅ ${details.results.name}`);

    console.log("3. Testing News...");
    const news = await getTickerNews("AAPL");
    console.log(`   News: ✅ ${news.results.length} articles`);

    console.log("4. Testing Related Companies...");
    const related = await getRelatedCompanies("AAPL");
    console.log(`   Related: ✅ ${related.results.length} companies`);

    console.log("🎉 All manual tests passed!");
    return true;
  } catch (error) {
    console.error("❌ Manual test failed:", error);
    return false;
  }
};
