import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Link,
  Skeleton,
} from "@mui/material";
import {
  ArrowBack,
  Business,
  Language,
  Phone,
  LocationOn,
  Article,
  OpenInNew,
  Group,
} from "@mui/icons-material";
import {
  getTickerDetails,
  getTickerNews,
  getRelatedCompanies,
  TickerDetailsResponse,
  NewsResponse,
  RelatedCompaniesResponse,
  PolygonApiError,
} from "../api/polygon-io-api";

interface LoadingState {
  details: boolean;
  news: boolean;
  related: boolean;
}

interface ErrorState {
  details: string | null;
  news: string | null;
  related: string | null;
}

const TickerDetail: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();

  // Data states
  const [tickerDetails, setTickerDetails] =
    useState<TickerDetailsResponse | null>(null);
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [relatedCompanies, setRelatedCompanies] =
    useState<RelatedCompaniesResponse | null>(null);

  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    details: true,
    news: true,
    related: true,
  });

  // Error states
  const [errors, setErrors] = useState<ErrorState>({
    details: null,
    news: null,
    related: null,
  });

  const handleBackClick = () => {
    // Check if we have history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleRelatedTickerClick = (ticker: string) => {
    navigate(`/ticker/${ticker}`);
  };

  // Reset states when symbol changes
  useEffect(() => {
    if (!symbol) return;

    // Reset all states when navigating to a new ticker
    setTickerDetails(null);
    setNewsData(null);
    setRelatedCompanies(null);
    setLoading({ details: true, news: true, related: true });
    setErrors({ details: null, news: null, related: null });

    // Scroll to top when navigating to a new ticker
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [symbol]);

  // Fetch all data when component mounts or symbol changes
  useEffect(() => {
    if (!symbol) return;

    const fetchTickerDetails = async () => {
      try {
        setLoading((prev) => ({ ...prev, details: true }));
        setErrors((prev) => ({ ...prev, details: null }));

        const data = await getTickerDetails(symbol);
        setTickerDetails(data);
      } catch (error) {
        const message =
          error instanceof PolygonApiError
            ? error.message
            : "Failed to load ticker details";
        setErrors((prev) => ({ ...prev, details: message }));
        console.error("Failed to fetch ticker details:", error);
      } finally {
        setLoading((prev) => ({ ...prev, details: false }));
      }
    };

    const fetchNews = async () => {
      try {
        setLoading((prev) => ({ ...prev, news: true }));
        setErrors((prev) => ({ ...prev, news: null }));

        const data = await getTickerNews(symbol);
        setNewsData(data);
      } catch (error) {
        const message =
          error instanceof PolygonApiError
            ? error.message
            : "Failed to load news";
        setErrors((prev) => ({ ...prev, news: message }));
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading((prev) => ({ ...prev, news: false }));
      }
    };

    const fetchRelatedCompanies = async () => {
      try {
        setLoading((prev) => ({ ...prev, related: true }));
        setErrors((prev) => ({ ...prev, related: null }));

        const data = await getRelatedCompanies(symbol);
        setRelatedCompanies(data);
      } catch (error) {
        const message =
          error instanceof PolygonApiError
            ? error.message
            : "Failed to load related companies";
        setErrors((prev) => ({ ...prev, related: message }));
        console.error("Failed to fetch related companies:", error);
      } finally {
        setLoading((prev) => ({ ...prev, related: false }));
      }
    };

    // Fetch all data with some delay to avoid rate limiting
    fetchTickerDetails();

    // Add small delays to reduce rate limiting issues
    setTimeout(() => {
      fetchNews();
    }, 200);

    setTimeout(() => {
      fetchRelatedCompanies();
    }, 400);
  }, [symbol]);

  const formatMarketCap = (value: number | undefined): string => {
    if (!value || value === 0) return "N/A";
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackClick}
          variant="outlined"
          sx={{ mb: 3 }}
        >
          Back to Search
        </Button>

        <Typography variant="h3" component="h1" gutterBottom color="primary">
          {symbol?.toUpperCase()}
          {tickerDetails?.results.name && (
            <Typography
              variant="h5"
              component="span"
              color="text.secondary"
              sx={{ ml: 2 }}
            >
              {tickerDetails.results.name}
            </Typography>
          )}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Company Details Section */}
        <Grid item xs={12} md={8}>
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Business color="primary" />
                Company Details
              </Typography>

              {loading.details ? (
                <Box>
                  <Skeleton variant="text" width="80%" height={40} />
                  <Skeleton variant="text" width="60%" height={30} />
                  <Skeleton variant="rectangular" width="100%" height={120} />
                </Box>
              ) : errors.details ? (
                <Alert severity="error">
                  <strong>Error loading company details:</strong>{" "}
                  {errors.details}
                </Alert>
              ) : tickerDetails?.results ? (
                <Box>
                  {/* Key metrics */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Market Cap
                      </Typography>
                      <Typography variant="h6">
                        {formatMarketCap(tickerDetails.results.market_cap)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Employees
                      </Typography>
                      <Typography variant="h6">
                        {tickerDetails.results.total_employees?.toLocaleString() ||
                          "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Exchange
                      </Typography>
                      <Typography variant="h6">
                        {tickerDetails.results.primary_exchange}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Listed
                      </Typography>
                      <Typography variant="h6">
                        {formatDate(tickerDetails.results.list_date)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Company description */}
                  {tickerDetails.results.description && (
                    <Typography variant="body1" paragraph>
                      {tickerDetails.results.description}
                    </Typography>
                  )}

                  {/* Additional info */}
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}
                  >
                    {tickerDetails.results.homepage_url && (
                      <Link
                        href={tickerDetails.results.homepage_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Language fontSize="small" />
                        Website
                        <OpenInNew fontSize="small" />
                      </Link>
                    )}

                    {tickerDetails.results.phone_number && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Phone fontSize="small" />
                        <Typography variant="body2">
                          {tickerDetails.results.phone_number}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Address */}
                  {tickerDetails.results.address && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      <LocationOn fontSize="small" />
                      <Typography variant="body2">
                        {[
                          tickerDetails.results.address.address1,
                          tickerDetails.results.address.city,
                          tickerDetails.results.address.state,
                          tickerDetails.results.address.postal_code,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : null}
            </CardContent>
          </Card>

          {/* News Section */}
          <Card elevation={3}>
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Article color="primary" />
                Latest News
              </Typography>

              {loading.news ? (
                <Box>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Skeleton variant="text" width="90%" height={30} />
                      <Skeleton variant="text" width="70%" height={20} />
                      <Skeleton variant="text" width="50%" height={20} />
                    </Box>
                  ))}
                </Box>
              ) : errors.news ? (
                <Alert severity="error">
                  <strong>Error loading news:</strong> {errors.news}
                </Alert>
              ) : newsData?.results && newsData.results.length > 0 ? (
                <List>
                  {newsData.results.slice(0, 5).map((article, index) => (
                    <React.Fragment key={article.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <Avatar
                          src={article.image_url}
                          alt={article.title}
                          variant="rounded"
                          sx={{ width: 80, height: 60, mr: 2, mt: 0.5 }}
                        />
                        <ListItemText
                          primary={
                            <Link
                              href={article.article_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              color="inherit"
                              underline="hover"
                              sx={{ fontWeight: "medium" }}
                            >
                              {article.title}
                            </Link>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                paragraph
                              >
                                {article.description}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {article.publisher.name} •{" "}
                                  {formatTimeAgo(article.published_utc)}
                                </Typography>
                                {article.insights &&
                                  article.insights.length > 0 && (
                                    <Chip
                                      label={article.insights[0].sentiment}
                                      size="small"
                                      color={
                                        article.insights[0].sentiment ===
                                        "positive"
                                          ? "success"
                                          : "error"
                                      }
                                      variant="outlined"
                                    />
                                  )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < newsData.results.slice(0, 5).length - 1 && (
                        <Divider component="li" />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent news found for {symbol}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Related Companies */}
          <Card elevation={3}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Group color="primary" />
                Related Companies
              </Typography>

              {loading.related ? (
                <Box>
                  {[1, 2, 3, 4].map((i) => (
                    <Box key={i} sx={{ mb: 1 }}>
                      <Skeleton variant="text" width="60%" height={30} />
                    </Box>
                  ))}
                </Box>
              ) : errors.related ? (
                <Alert severity="warning">
                  <Typography variant="body2">
                    Could not load related companies
                  </Typography>
                </Alert>
              ) : relatedCompanies?.results &&
                relatedCompanies.results.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {relatedCompanies.results.map((company) => (
                    <Button
                      key={company.ticker}
                      variant="outlined"
                      size="small"
                      onClick={() => handleRelatedTickerClick(company.ticker)}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      {company.ticker}
                    </Button>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No related companies found
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Company Logo */}
          {tickerDetails?.results.branding?.logo_url && (
            <Card elevation={3} sx={{ mt: 3 }}>
              <CardContent sx={{ textAlign: "center" }}>
                <img
                  src={tickerDetails.results.branding.logo_url}
                  alt={`${tickerDetails.results.name} logo`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "150px",
                    objectFit: "contain",
                  }}
                />
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default TickerDetail;
