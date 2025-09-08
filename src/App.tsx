import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TickerSearch from "./components/TickerSearch";
import TickerDetail from "./components/TickerDetail";
import ApiTestRunner from "./components/ApiTestRunner";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<TickerSearch />} />
            <Route path="/ticker/:symbol" element={<TickerDetail />} />
            <Route path="/test-api" element={<ApiTestRunner />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
