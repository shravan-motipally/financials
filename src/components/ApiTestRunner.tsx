import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Container,
  Paper,
} from "@mui/material";
import {
  CheckCircle,
  Error,
  SkipNext,
  PlayArrow,
  Speed,
  ApiOutlined,
} from "@mui/icons-material";
import ApiIntegrationTester, { TestResult } from "../utils/testApiIntegration";

const ApiTestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setHasRun(false);

    try {
      const tester = new ApiIntegrationTester();
      const results = await tester.runAllTests();
      setTestResults(results);
      setHasRun(true);
    } catch (error) {
      console.error("Test runner error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle color="success" />;
      case "FAIL":
        return <Error color="error" />;
      case "SKIP":
        return <SkipNext color="disabled" />;
      default:
        return <ApiOutlined />;
    }
  };

  const getStatusColor = (status: string): "success" | "error" | "default" => {
    switch (status) {
      case "PASS":
        return "success";
      case "FAIL":
        return "error";
      default:
        return "default";
    }
  };

  const summary = {
    total: testResults.length,
    passed: testResults.filter((r) => r.status === "PASS").length,
    failed: testResults.filter((r) => r.status === "FAIL").length,
    skipped: testResults.filter((r) => r.status === "SKIP").length,
    totalDuration: testResults.reduce((sum, r) => sum + r.duration, 0),
  };

  const apiKeyConfigured = !!process.env.REACT_APP_POLYGONIO_KEY;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          🧪 API Integration Test Runner
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Test all Polygon.io API functions to verify they work correctly
        </Typography>

        {!apiKeyConfigured && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <strong>API Key Not Configured:</strong> Some tests will be skipped.
            Please add your <code>REACT_APP_POLYGONIO_KEY</code> to the .env
            file to run all tests.
          </Alert>
        )}

        <Button
          variant="contained"
          size="large"
          startIcon={isRunning ? <Speed /> : <PlayArrow />}
          onClick={runTests}
          disabled={isRunning}
          sx={{ mb: 3 }}
        >
          {isRunning ? "Running Tests..." : "Run All API Tests"}
        </Button>

        {isRunning && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Testing API functions... Please wait
            </Typography>
          </Box>
        )}
      </Box>

      {hasRun && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📊 Test Summary
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
            <Chip label={`Total: ${summary.total}`} variant="outlined" />
            <Chip
              label={`Passed: ${summary.passed}`}
              color="success"
              variant={summary.passed > 0 ? "filled" : "outlined"}
            />
            <Chip
              label={`Failed: ${summary.failed}`}
              color="error"
              variant={summary.failed > 0 ? "filled" : "outlined"}
            />
            <Chip
              label={`Skipped: ${summary.skipped}`}
              color="default"
              variant={summary.skipped > 0 ? "filled" : "outlined"}
            />
            <Chip
              label={`${summary.totalDuration}ms`}
              icon={<Speed />}
              variant="outlined"
            />
          </Box>

          {summary.failed === 0 && summary.passed > 0 && (
            <Alert severity="success">
              🎉 All tests passed! Your API integration is working correctly.
            </Alert>
          )}

          {summary.failed > 0 && (
            <Alert severity="error">
              ❌ Some tests failed. Check the details below and verify your API
              configuration.
            </Alert>
          )}
        </Paper>
      )}

      {testResults.length > 0 && (
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔍 Test Results
            </Typography>
            <List>
              {testResults.map((result, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>{getStatusIcon(result.status)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body1">
                            {result.testName}
                          </Typography>
                          <Chip
                            label={result.status}
                            size="small"
                            color={getStatusColor(result.status)}
                            variant="filled"
                          />
                          {result.duration > 0 && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {result.duration}ms
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color={
                            result.status === "FAIL"
                              ? "error"
                              : "text.secondary"
                          }
                        >
                          {result.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < testResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {!hasRun && !isRunning && (
        <Alert severity="info">
          Click "Run All API Tests" to verify your API integration is working
          correctly. This will test all Polygon.io API functions used by the
          application.
        </Alert>
      )}
    </Container>
  );
};

export default ApiTestRunner;
