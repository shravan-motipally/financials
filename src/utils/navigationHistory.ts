/**
 * Navigation History Utility
 *
 * Manages browser navigation history and recently viewed tickers
 * across the application using localStorage for persistence.
 */

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "recentlyViewedTickers";
const MAX_HISTORY_SIZE = 10;

export interface NavigationHistoryItem {
  ticker: string;
  timestamp: number;
  name?: string;
}

export class NavigationHistoryManager {
  /**
   * Add a ticker to the navigation history
   */
  static addTicker(ticker: string, name?: string): void {
    try {
      const existing = this.getHistory();

      // Remove existing entry if present
      const filtered = existing.filter((item) => item.ticker !== ticker);

      // Add new entry at the beginning
      const newEntry: NavigationHistoryItem = {
        ticker,
        timestamp: Date.now(),
        name,
      };

      const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY_SIZE);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error adding ticker to history:", error);
    }
  }

  /**
   * Get the full navigation history
   */
  static getHistory(): NavigationHistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      // Ensure all items have required fields
      return parsed.filter(
        (item: any) =>
          item &&
          typeof item.ticker === "string" &&
          typeof item.timestamp === "number",
      );
    } catch (error) {
      console.error("Error reading navigation history:", error);
      return [];
    }
  }

  /**
   * Get recently viewed ticker symbols only
   */
  static getRecentTickers(): string[] {
    return this.getHistory().map((item) => item.ticker);
  }

  /**
   * Clear all navigation history
   */
  static clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing navigation history:", error);
    }
  }

  /**
   * Remove a specific ticker from history
   */
  static removeTicker(ticker: string): void {
    try {
      const existing = this.getHistory();
      const filtered = existing.filter((item) => item.ticker !== ticker);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error removing ticker from history:", error);
    }
  }

  /**
   * Get history items from the last N days
   */
  static getRecentHistory(days: number = 7): NavigationHistoryItem[] {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.getHistory().filter((item) => item.timestamp > cutoff);
  }

  /**
   * Check if localStorage is available
   */
  static isStorageAvailable(): boolean {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, "test");
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Hook for using navigation history in React components
 */
export const useNavigationHistory = () => {
  const [history, setHistory] = useState<NavigationHistoryItem[]>([]);

  useEffect(() => {
    // Load initial history
    setHistory(NavigationHistoryManager.getHistory());

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setHistory(NavigationHistoryManager.getHistory());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addTicker = useCallback((ticker: string, name?: string) => {
    NavigationHistoryManager.addTicker(ticker, name);
    setHistory(NavigationHistoryManager.getHistory());
  }, []);

  const clearHistory = useCallback(() => {
    NavigationHistoryManager.clearHistory();
    setHistory([]);
  }, []);

  const removeTicker = useCallback((ticker: string) => {
    NavigationHistoryManager.removeTicker(ticker);
    setHistory(NavigationHistoryManager.getHistory());
  }, []);

  return {
    history,
    addTicker,
    clearHistory,
    removeTicker,
    recentTickers: history.map((item) => item.ticker),
  };
};

// Export default
export default NavigationHistoryManager;
