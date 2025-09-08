#!/usr/bin/env node
/**
 * Test Pre-commit Setup
 *
 * This script tests the pre-commit hooks and secret detection
 * without actually committing anything to the repository.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const colors = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

console.log(
  `${colors.blue}${colors.bold}🧪 Testing Pre-commit Setup${colors.reset}\n`,
);

// Test 1: Check if gitleaks is installed
function testGitleaksInstallation() {
  console.log(
    `${colors.bold}1. Testing Gitleaks Installation...${colors.reset}`,
  );

  try {
    const version = execSync("gitleaks version", { encoding: "utf8" });
    console.log(`   ✅ Gitleaks installed: ${version.trim()}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Gitleaks not found! Please install gitleaks:`);
    console.log(`      Windows: choco install gitleaks`);
    console.log(`      macOS: brew install gitleaks`);
    console.log(
      `      Linux: Download from https://github.com/gitleaks/gitleaks/releases`,
    );
    return false;
  }
}

// Test 2: Check if Husky is set up
function testHuskySetup() {
  console.log(`\n${colors.bold}2. Testing Husky Setup...${colors.reset}`);

  const huskyDir = ".husky";
  const preCommitFile = path.join(huskyDir, "pre-commit");
  const commitMsgFile = path.join(huskyDir, "commit-msg");

  if (!fs.existsSync(huskyDir)) {
    console.log(`   ❌ .husky directory not found! Run: npx husky init`);
    return false;
  }

  if (!fs.existsSync(preCommitFile)) {
    console.log(`   ❌ pre-commit hook not found!`);
    return false;
  }

  if (!fs.existsSync(commitMsgFile)) {
    console.log(`   ❌ commit-msg hook not found!`);
    return false;
  }

  console.log(`   ✅ Husky hooks configured`);
  return true;
}

// Test 3: Create test file with secrets and test detection
function testSecretDetection() {
  console.log(`\n${colors.bold}3. Testing Secret Detection...${colors.reset}`);

  const testFile = "test-secrets.tmp";
  const testContent = `
// Test file with various types of secrets
const apiKey = "pk_live_1234567890abcdef1234567890abcdef";
const polygonKey = "REACT_APP_POLYGONIO_KEY=pk_test_abcdefghijklmnopqrstuvwxyz123456";
const awsKey = "AKIA1234567890123456";
const genericSecret = "password=supersecretpassword123";
const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  `;

  try {
    // Write test file
    fs.writeFileSync(testFile, testContent);

    // Test gitleaks on the file
    try {
      execSync(`gitleaks detect --source ${testFile} --verbose`, {
        encoding: "utf8",
      });
      console.log(`   ❌ Secret detection failed - should have found secrets!`);
      return false;
    } catch (error) {
      // Gitleaks should fail (exit code 1) when secrets are found
      if (error.status === 1) {
        console.log(`   ✅ Secret detection working - found test secrets`);
        return true;
      } else {
        console.log(`   ❌ Unexpected error: ${error.message}`);
        return false;
      }
    }
  } catch (error) {
    console.log(`   ❌ Error testing secret detection: ${error.message}`);
    return false;
  } finally {
    // Clean up test file
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  }
}

// Test 4: Test lint-staged configuration
function testLintStaged() {
  console.log(
    `\n${colors.bold}4. Testing lint-staged Configuration...${colors.reset}`,
  );

  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

    if (!packageJson["lint-staged"]) {
      console.log(`   ❌ lint-staged configuration not found in package.json`);
      return false;
    }

    const lintStagedConfig = packageJson["lint-staged"];
    const hasTypeScriptLinting = lintStagedConfig["*.{ts,tsx,js,jsx}"];
    const hasGitleaksCheck = Object.values(lintStagedConfig).some(
      (commands) =>
        Array.isArray(commands) &&
        commands.some((cmd) => cmd.includes("gitleaks")),
    );

    if (!hasTypeScriptLinting) {
      console.log(`   ❌ TypeScript linting not configured`);
      return false;
    }

    if (!hasGitleaksCheck) {
      console.log(`   ❌ Gitleaks not configured in lint-staged`);
      return false;
    }

    console.log(`   ✅ lint-staged properly configured`);
    return true;
  } catch (error) {
    console.log(`   ❌ Error reading package.json: ${error.message}`);
    return false;
  }
}

// Test 5: Test npm scripts
function testNpmScripts() {
  console.log(`\n${colors.bold}5. Testing NPM Scripts...${colors.reset}`);

  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const scripts = packageJson.scripts || {};

    const requiredScripts = [
      "secret-scan",
      "secret-scan:staged",
      "lint",
      "format",
      "type-check",
    ];

    const missingScripts = requiredScripts.filter((script) => !scripts[script]);

    if (missingScripts.length > 0) {
      console.log(`   ❌ Missing scripts: ${missingScripts.join(", ")}`);
      return false;
    }

    console.log(`   ✅ All required npm scripts configured`);
    return true;
  } catch (error) {
    console.log(`   ❌ Error checking npm scripts: ${error.message}`);
    return false;
  }
}

// Test 6: Test gitleaks configuration
function testGitleaksConfig() {
  console.log(
    `\n${colors.bold}6. Testing Gitleaks Configuration...${colors.reset}`,
  );

  const configFile = ".gitleaks.toml";

  if (!fs.existsSync(configFile)) {
    console.log(
      `   ⚠️  No custom gitleaks configuration found (using defaults)`,
    );
    return true;
  }

  try {
    const config = fs.readFileSync(configFile, "utf8");

    if (config.includes("polygon")) {
      console.log(`   ✅ Custom Polygon.io rules configured`);
    } else {
      console.log(
        `   ⚠️  Custom configuration exists but no Polygon.io specific rules`,
      );
    }

    return true;
  } catch (error) {
    console.log(`   ❌ Error reading gitleaks config: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  const tests = [
    testGitleaksInstallation,
    testHuskySetup,
    testSecretDetection,
    testLintStaged,
    testNpmScripts,
    testGitleaksConfig,
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    if (test()) {
      passed++;
    }
  }

  // Summary
  console.log(`\n${colors.bold}📊 Test Summary:${colors.reset}`);
  console.log(`Tests passed: ${passed}/${total}`);

  if (passed === total) {
    console.log(
      `\n${colors.green}${colors.bold}🎉 All tests passed! Pre-commit setup is working correctly.${colors.reset}`,
    );
    console.log(`\n${colors.blue}Next steps:${colors.reset}`);
    console.log(`1. Make sure to install gitleaks if not already installed`);
    console.log(
      `2. Test with a real commit: git add . && git commit -m "test: verify pre-commit hooks"`,
    );
    console.log(`3. The hooks will automatically run on every commit`);
  } else {
    console.log(
      `\n${colors.red}${colors.bold}❌ Some tests failed. Please fix the issues above.${colors.reset}`,
    );
    process.exit(1);
  }
}

// Handle command line arguments
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
