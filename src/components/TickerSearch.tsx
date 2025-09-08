import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Paper,
  InputAdornment,
  Container,
  Divider,
  Alert,
  CardActionArea,
  CircularProgress,
  IconButton,
  Button,
} from "@mui/material";
import {
  Search,
  Business,
  History,
  Clear,
  TrendingUp,
  AccessTime,
} from "@mui/icons-material";
import {
  searchTickers,
  TickerSearchItem,
  PolygonTickerSearchResponse,
} from "../api/polygon-io-api";
import { useSearchHistory } from "../utils/searchHistory";

const TickerSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<TickerSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const navigate = useNavigate();
  const {
    searchHistory,
    recentlyClicked,
    addSearchTerm,
    addRecentlyClicked,
    clearSearchHistory,
    clearRecentlyClicked,
  } = useSearchHistory();

  // Handle search execution (called on Enter key press)
  const executeSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        console.log("🔍 Searching for:", term);
        const response: PolygonTickerSearchResponse = await searchTickers(
          term.trim(),
        );

        if (response.results) {
          setSearchResults(response.results);
          addSearchTerm(term.trim(), response.results.length);
          console.log(
            `✅ Found ${response.results.length} results for "${term}"`,
          );
        } else {
          setSearchResults([]);
          addSearchTerm(term.trim(), 0);
          console.log(`❌ No results found for "${term}"`);
        }
      } catch (err: any) {
        console.error("Search error:", err);
        setError(err.message || "Failed to search tickers. Please try again.");
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [addSearchTerm],
  );

  // Handle Enter key press
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      executeSearch(searchTerm);
    }
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle ticker click
  const handleTickerClick = (ticker: TickerSearchItem) => {
    console.log("Navigating to ticker:", ticker.ticker);
    addRecentlyClicked(ticker.ticker, ticker.name);
    navigate(`/ticker/${ticker.ticker}`);
  };

  // Handle search from history
  const handleHistorySearch = (term: string) => {
    setSearchTerm(term);
    executeSearch(term);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          Financials Ticker Search
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Search for stocks, ETFs, and other financial instruments
        </Typography>
      </Box>

      {/* Search Input */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by ticker symbol or company name... (Press Enter to search)"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="primary" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} size="small">
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              fontSize: "1.1rem",
              "&:hover": {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              },
            },
          }}
        />

        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            💡 Tip: Press Enter to search using live market data
          </Typography>

          {searchTerm && (
            <Button
              variant="contained"
              onClick={() => executeSearch(searchTerm)}
              disabled={isLoading}
              startIcon={
                isLoading ? <CircularProgress size={16} /> : <Search />
              }
              size="small"
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Loading State */}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 4,
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Searching live market data...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1">
            <strong>Search Error:</strong> {error}
          </Typography>
        </Alert>
      )}

      {/* Search Results */}
      {hasSearched && !isLoading && searchResults.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <TrendingUp color="primary" />
            Search Results ({searchResults.length})
          </Typography>
          <Grid container spacing={3}>
            {searchResults.map((ticker, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={`${ticker.ticker}-${index}`}
              >
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      elevation: 6,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleTickerClick(ticker)}
                    sx={{ height: "100%" }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="h2"
                          color="primary"
                          noWrap
                        >
                          {ticker.ticker}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Chip
                            label={ticker.market.toUpperCase()}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={ticker.active ? "Active" : "Inactive"}
                            size="small"
                            color={ticker.active ? "success" : "error"}
                            variant="outlined"
                          />
                        </Box>
                      </Box>

                      <Typography
                        variant="body1"
                        color="text.primary"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        {ticker.name}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                          label={ticker.type}
                          size="small"
                          variant="outlined"
                        />
                        {ticker.primary_exchange && (
                          <Chip
                            label={ticker.primary_exchange}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        <Chip
                          label={ticker.locale.toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* No Results */}
      {hasSearched && !isLoading && searchResults.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1">
            <strong>No results found</strong> for "{searchTerm}". Try a
            different search term or ticker symbol.
          </Typography>
        </Alert>
      )}

      {/* Search History Section */}
      {!hasSearched && searchHistory.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <History color="primary" />
              Search History
            </Typography>
            <Button
              onClick={clearSearchHistory}
              size="small"
              color="secondary"
              startIcon={<Clear />}
            >
              Clear History
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {searchHistory.slice(0, 12).map((item, index) => (
              <Chip
                key={index}
                label={`${item.searchTerm} (${item.resultCount})`}
                onClick={() => handleHistorySearch(item.searchTerm)}
                clickable
                variant="outlined"
                color="primary"
                icon={<Search />}
              />
            ))}
          </Box>
          <Divider sx={{ mt: 3 }} />
        </Box>
      )}

      {/* Recently Clicked Section */}
      {!hasSearched && recentlyClicked.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <AccessTime color="primary" />
              Recently Viewed
            </Typography>
            <Button
              onClick={clearRecentlyClicked}
              size="small"
              color="secondary"
              startIcon={<Clear />}
            >
              Clear
            </Button>
          </Box>

          <Grid container spacing={2}>
            {recentlyClicked.slice(0, 8).map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={1}
                  sx={{
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      elevation: 3,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/ticker/${item.ticker}`)}
                    sx={{ p: 2 }}
                  >
                    <Typography variant="h6" color="primary" noWrap>
                      {item.ticker}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {item.name}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Welcome Message when no history */}
      {!hasSearched &&
        searchHistory.length === 0 &&
        recentlyClicked.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Business sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Welcome to Financials Search
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start by searching for a ticker symbol or company name above.
              <br />
              Your search history and recently viewed tickers will appear here.
            </Typography>
          </Box>
        )}
    </Container>
  );
};

export default TickerSearch;
