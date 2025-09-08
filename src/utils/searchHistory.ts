/**
 * Search History Utility
 *
 * Manages search history and recently clicked tickers
 * with localStorage persistence
 */

import { useState, useEffect, useCallback } from "react";

const SEARCH_HISTORY_KEY = "tickerSearchHistory";
const RECENTLY_CLICKED_KEY = "recentlyClickedTickers";
const MAX_SEARCH_HISTORY = 12;
const MAX_RECENTLY_CLICKED = 10;

export interface SearchHistoryItem {
  searchTerm: string;
  timestamp: number;
  resultCount: number;
}

export interface RecentlyClickedItem {
  ticker: string;
  name: string;
  timestamp: number;
}

export class SearchHistoryManager {
  /**
   * Add a search term to the history
   */
  static addSearchTerm(searchTerm: string, resultCount: number): void {
    try {
      const existing = this.getSearchHistory();

      // Remove existing entry if present
      const filtered = existing.filter(
        (item) => item.searchTerm.toLowerCase() !== searchTerm.toLowerCase(),
      );

      // Add new entry at the beginning
      const newEntry: SearchHistoryItem = {
        searchTerm,
        timestamp: Date.now(),
        resultCount,
      };

      const updated = [newEntry, ...filtered].slice(0, MAX_SEARCH_HISTORY);

      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error adding search term to history:", error);
    }
  }

  /**
   * Get search history
   */
  static getSearchHistory(): SearchHistoryItem[] {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      return parsed.filter(
        (item: any) =>
          item &&
          typeof item.searchTerm === "string" &&
          typeof item.timestamp === "number",
      );
    } catch (error) {
      console.error("Error reading search history:", error);
      return [];
    }
  }

  /**
   * Add a recently clicked ticker
   */
  static addRecentlyClicked(ticker: string, name: string): void {
    try {
      const existing = this.getRecentlyClicked();

      // Remove existing entry if present
      const filtered = existing.filter((item) => item.ticker !== ticker);

      // Add new entry at the beginning
      const newEntry: RecentlyClickedItem = {
        ticker,
        name,
        timestamp: Date.now(),
      };

      const updated = [newEntry, ...filtered].slice(0, MAX_RECENTLY_CLICKED);

      localStorage.setItem(RECENTLY_CLICKED_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error adding recently clicked ticker:", error);
    }
  }

  /**
   * Get recently clicked tickers
   */
  static getRecentlyClicked(): RecentlyClickedItem[] {
    try {
      const stored = localStorage.getItem(RECENTLY_CLICKED_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      return parsed.filter(
        (item: any) =>
          item &&
          typeof item.ticker === "string" &&
          typeof item.name === "string" &&
          typeof item.timestamp === "number",
      );
    } catch (error) {
      console.error("Error reading recently clicked tickers:", error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  static clearSearchHistory(): void {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error("Error clearing search history:", error);
    }
  }

  /**
   * Clear recently clicked
   */
  static clearRecentlyClicked(): void {
    try {
      localStorage.removeItem(RECENTLY_CLICKED_KEY);
    } catch (error) {
      console.error("Error clearing recently clicked:", error);
    }
  }
}

/**
 * React hook for search history management
 */
export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [recentlyClicked, setRecentlyClicked] = useState<RecentlyClickedItem[]>(
    [],
  );

  // Load initial data
  useEffect(() => {
    setSearchHistory(SearchHistoryManager.getSearchHistory());
    setRecentlyClicked(SearchHistoryManager.getRecentlyClicked());

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SEARCH_HISTORY_KEY) {
        setSearchHistory(SearchHistoryManager.getSearchHistory());
      } else if (e.key === RECENTLY_CLICKED_KEY) {
        setRecentlyClicked(SearchHistoryManager.getRecentlyClicked());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addSearchTerm = useCallback(
    (searchTerm: string, resultCount: number) => {
      SearchHistoryManager.addSearchTerm(searchTerm, resultCount);
      setSearchHistory(SearchHistoryManager.getSearchHistory());
    },
    [],
  );

  const addRecentlyClicked = useCallback((ticker: string, name: string) => {
    SearchHistoryManager.addRecentlyClicked(ticker, name);
    setRecentlyClicked(SearchHistoryManager.getRecentlyClicked());
  }, []);

  const clearSearchHistory = useCallback(() => {
    SearchHistoryManager.clearSearchHistory();
    setSearchHistory([]);
  }, []);

  const clearRecentlyClicked = useCallback(() => {
    SearchHistoryManager.clearRecentlyClicked();
    setRecentlyClicked([]);
  }, []);

  return {
    searchHistory,
    recentlyClicked,
    addSearchTerm,
    addRecentlyClicked,
    clearSearchHistory,
    clearRecentlyClicked,
  };
};

export default SearchHistoryManager;
