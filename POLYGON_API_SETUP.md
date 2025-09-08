# Polygon.io API Setup Instructions

## Step 1: Get Your API Key

1. Go to [Polygon.io](https://polygon.io/)
2. Sign up for a free account or log in
3. Navigate to your [API Keys Dashboard](https://polygon.io/dashboard/api-keys)
4. Copy your API key

## Step 2: Create Environment File

1. In the project root directory (same level as `package.json`), create a file named `.env`
2. Add the following content to the `.env` file:

```env
# Polygon.io API Configuration (matches existing project convention)
REACT_APP_POLYGONIO_KEY=your_actual_api_key_here
```

3. Replace `your_actual_api_key_here` with your actual API key from Step 1

## Step 3: Restart Development Server

After creating the `.env` file, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

## Verification

When the server starts, check the browser console. You should see:

- ✅ "API Key configured: true"
- ✅ No warning messages about missing API key

If you see warnings, double-check:

1. The `.env` file is in the correct location (project root)
2. The API key is correctly formatted
3. You've restarted the development server

## Security Notes

- ✅ The `.env` file should be added to `.gitignore` (if not already)
- ✅ Never commit your actual API key to version control
- ✅ The `REACT_APP_` prefix is required for React environment variables
- ✅ Use `REACT_APP_POLYGONIO_KEY` (matches existing project convention)

## API Endpoints Used

The application will use these Polygon.io endpoints:

- **Ticker Details**: `/v3/reference/tickers/{ticker}`
- **News**: `/v2/reference/news?ticker={ticker}`
- **Related Companies**: `/v1/related-companies/{ticker}`

## Free Tier Limits

Polygon.io free tier includes:

- 5 API calls per minute
- Basic market data
- Limited historical data

For production use, consider upgrading to a paid plan.
