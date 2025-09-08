/**
 * Manual API Integration Test Runner
 *
 * This script can be imported and run in the browser console or in a React component
 * to manually test all API functions and verify they work correctly.
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

export interface TestResult {
  testName: string;
  status: "PASS" | "FAIL" | "SKIP";
  message: string;
  duration: number;
  data?: any;
}

export class ApiIntegrationTester {
  private results: TestResult[] = [];
  private readonly testTicker = "AAPL";
  private readonly testSearchTerm = "Apple";
  private readonly testFromDate = new Date("2023-12-01");
  private readonly testToDate = new Date("2023-12-01");

  async runAllTests(): Promise<TestResult[]> {
    console.log("🧪 Starting API Integration Tests...");
    console.log("=====================================");

    this.results = [];

    // Check if API key is configured
    const apiKeyConfigured = !!process.env.REACT_APP_POLYGONIO_KEY;
    if (!apiKeyConfigured) {
      console.warn(
        "⚠️  REACT_APP_POLYGONIO_KEY not configured. Some tests will be skipped.",
      );
    }

    // Run all tests
    await this.testApiHealth(apiKeyConfigured);
    await this.testGetAggregateData(apiKeyConfigured);
    await this.testGetTickerData(apiKeyConfigured);
    await this.testGetAllTickerData(apiKeyConfigured);
    await this.testGetFinancials(apiKeyConfigured);
    await this.testGetTickerDetails(apiKeyConfigured);
    await this.testGetTickerNews(apiKeyConfigured);
    await this.testGetRelatedCompanies(apiKeyConfigured);
    await this.testErrorHandling(apiKeyConfigured);

    // Print summary
    this.printSummary();

    return this.results;
  }

  private async runTest(
    testName: string,
    testFn: () => Promise<any>,
    skipTest: boolean = false,
  ): Promise<void> {
    if (skipTest) {
      this.results.push({
        testName,
        status: "SKIP",
        message: "API key not configured",
        duration: 0,
      });
      console.log(`⏭️  ${testName}: SKIPPED`);
      return;
    }

    const startTime = Date.now();

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;

      this.results.push({
        testName,
        status: "PASS",
        message: "Test completed successfully",
        duration,
        data: result,
      });

      console.log(`✅ ${testName}: PASS (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : "Unknown error";

      this.results.push({
        testName,
        status: "FAIL",
        message,
        duration,
      });

      console.error(`❌ ${testName}: FAIL (${duration}ms) - ${message}`);
    }
  }

  private async testApiHealth(apiKeyConfigured: boolean): Promise<void> {
    await this.runTest(
      "API Health Check",
      async () => {
        const isHealthy = await checkApiHealth();
        if (!isHealthy) {
          throw new Error("Health check failed");
        }
        return { healthy: isHealthy };
      },
      !apiKeyConfigured,
    );
  }

  private async testGetAggregateData(apiKeyConfigured: boolean): Promise<void> {
    await this.runTest(
      "Get Aggregate Data",
      async () => {
        const result = await getAggregateData(
          this.testTicker,
          1,
          "day",
          this.testFromDate,
          this.testToDate,
        );

        if (!result || !result.ticker) {
          throw new Error("Invalid response structure");
        }

        console.log(
          `   📊 Found ${result.resultsCount || 0} data points for ${result.ticker}`,
        );
        return result;
      },
      !apiKeyConfigured,
    );
  }

  private async testGetTickerData(apiKeyConfigured: boolean): Promise<void> {
    await this.runTest(
      "Get Ticker Search Data",
      async () => {
        const result = await getTickerData(this.testSearchTerm);

        if (!result || !Array.isArray(result.results)) {
          throw new Error("Invalid response structure");
        }

        console.log(
          `   🔍 Found ${result.results.length} tickers for "${this.testSearchTerm}"`,
        );
        return result;
      },
      !apiKeyConfigured,
    );
  }

  private async testGetAllTickerData(apiKeyConfigured: boolean): Promise<void> {
    await this.runTest(
      "Get All Ticker Data",
      async () => {
        const result = await getAllTickerData();

        if (!result || !Array.isArray(result.results)) {
          throw new Error("Invalid response structure");
        }

        console.log(`   📈 Found ${result.results.length} total tickers`);
        return result;
      },
      !apiKeyConfigured,
    );
  }

  private async testGetFinancials(apiKeyConfigured: boolean): Promise<void> {
    await this.runTest(
      "Get Financial Data",
      async () => {
        const result = await getFinancials(this.testTicker);

        if (!result) {
          throw new Error("No financial data returned");
        }

        console.log(`   💰 Retrieved financial data for ${this.testTicker}`);
        return result;
      },
      !apiKeyConfigured,
    );
  }

  private async testGetTickerDetails(apiKeyConfigured: boolean): Promise<void> {
    await this.runTest(
      "Get Ticker Details",
      async () => {
        const result = await getTickerDetails(this.testTicker);

        if (!result || result.status !== "OK" || !result.results) {
          throw new Error("Invalid ticker details response");
        }

        console.log(
          `   🏢 ${result.results.name}: ${result.results.description?.substring(0, 80)}...`,
        );
        return result;
      },
      !apiKeyConfigured,
    );
  }

  private async testGetTickerNews(apiKeyConfigured: boolean): Promise<void> {
    await this.runTest(
      "Get Ticker News",
      async () => {
        const result = await getTickerNews(this.testTicker);

        if (
          !result ||
          result.status !== "OK" ||
          !Array.isArray(result.results)
        ) {
          throw new Error("Invalid news response");
        }

        console.log(`   📰 Found ${result.results.length} news articles`);
        if (result.results.length > 0) {
          console.log(
            `   📄 Latest: "${result.results[0].title?.substring(0, 60)}..."`,
          );
        }
        return result;
      },
      !apiKeyConfigured,
    );
  }

  private async testGetRelatedCompanies(
    apiKeyConfigured: boolean,
  ): Promise<void> {
    await this.runTest(
      "Get Related Companies",
      async () => {
        const result = await getRelatedCompanies(this.testTicker);

        if (
          !result ||
          result.status !== "OK" ||
          !Array.isArray(result.results)
        ) {
          throw new Error("Invalid related companies response");
        }

        console.log(`   🏭 Found ${result.results.length} related companies`);
        if (result.results.length > 0) {
          console.log(
            `   🔗 Related: ${result.results
              .slice(0, 5)
              .map((r) => r.ticker)
              .join(", ")}${result.results.length > 5 ? "..." : ""}`,
          );
        }
        return result;
      },
      !apiKeyConfigured,
    );
  }

  private async testErrorHandling(apiKeyConfigured: boolean): Promise<void> {
    await this.runTest(
      "Error Handling",
      async () => {
        try {
          await getTickerDetails("INVALID_TICKER_XYZ123");
          console.log(
            "   ⚠️  No error thrown for invalid ticker (API returned result)",
          );
          return { errorHandling: "no_error_thrown" };
        } catch (error) {
          if (error instanceof PolygonApiError) {
            console.log(
              `   ✅ Properly caught PolygonApiError: ${error.message}`,
            );
            return { errorHandling: "proper_error_caught" };
          } else {
            throw new Error(`Unexpected error type: ${error}`);
          }
        }
      },
      !apiKeyConfigured,
    );
  }

  private printSummary(): void {
    console.log("\n📊 Test Summary");
    console.log("================");

    const passed = this.results.filter((r) => r.status === "PASS").length;
    const failed = this.results.filter((r) => r.status === "FAIL").length;
    const skipped = this.results.filter((r) => r.status === "SKIP").length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);

    if (failed > 0) {
      console.log("\n❌ Failed Tests:");
      this.results
        .filter((r) => r.status === "FAIL")
        .forEach((r) => console.log(`   - ${r.testName}: ${r.message}`));
    }

    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`\n⏱️  Total Duration: ${totalDuration}ms`);

    if (failed === 0 && passed > 0) {
      console.log("\n🎉 All tests passed!");
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }
}

// Export convenience function for easy browser console testing
export const runApiTests = async (): Promise<TestResult[]> => {
  const tester = new ApiIntegrationTester();
  return await tester.runAllTests();
};

// Export for use in React components
export default ApiIntegrationTester;
