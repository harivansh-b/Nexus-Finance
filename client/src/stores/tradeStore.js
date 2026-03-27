import { create } from 'zustand';
import apiClient from '../services/api';

export const useTradeStore = create((set, get) => ({
  cryptoList: [],
  selectedCrypto: null,
  portfolio: [],
  transactions: [],
  watchlist: [],
  portfolioSummary: null,
  isLoading: false,
  error: null,

  // Fetch crypto list
  fetchCryptoList: async (limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/crypto/list', { params: { limit } });
      set({ cryptoList: response.data });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch crypto list' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch portfolio
  fetchPortfolio: async () => {
    try {
      const response = await apiClient.get('/trade/portfolio');
      set({ portfolio: response.data });
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    }
  },

  // Fetch portfolio summary
  fetchPortfolioSummary: async () => {
    try {
      const response = await apiClient.get('/trade/portfolio/summary');
      set({ portfolioSummary: response.data });
    } catch (error) {
      console.error('Failed to fetch portfolio summary:', error);
    }
  },

  // Fetch transactions
  fetchTransactions: async (limit = 20, page = 1) => {
    try {
      const response = await apiClient.get('/trade/transactions', {
        params: { limit, page },
      });
      set({ transactions: response.data.transactions });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  },

  // Fetch watchlist
  fetchWatchlist: async () => {
    try {
      const response = await apiClient.get('/trade/watchlist');
      set({ watchlist: response.data });
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    }
  },

  // Add to watchlist
  addToWatchlist: async (coin) => {
    try {
      await apiClient.post('/trade/watchlist/add', {
        coinName: coin.name,
        coinSymbol: coin.symbol,
        coingeckoId: coin.id,
        logo: coin.image,
      });
      await get().fetchWatchlist();
    } catch (error) {
      set({ error: error.message || 'Failed to add to watchlist' });
    }
  },

  // Remove from watchlist
  removeFromWatchlist: async (coingeckoId) => {
    try {
      await apiClient.post('/trade/watchlist/remove', { coingeckoId });
      await get().fetchWatchlist();
    } catch (error) {
      set({ error: error.message || 'Failed to remove from watchlist' });
    }
  },

  // Buy crypto
  buyCrypto: async (coin, amount) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/trade/buy', {
        coingeckoId: coin.id,
        amount,
        coinName: coin.name,
        coinSymbol: coin.symbol,
      });
      await get().fetchPortfolio();
      await get().fetchPortfolioSummary();
      return response.data;
    } catch (error) {
      const message = error.message || 'Failed to buy crypto';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Sell crypto
  sellCrypto: async (coingeckoId, amount) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/trade/sell', {
        coingeckoId,
        amount,
      });
      await get().fetchPortfolio();
      await get().fetchPortfolioSummary();
      return response.data;
    } catch (error) {
      const message = error.message || 'Failed to sell crypto';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Search crypto
  searchCrypto: async (query) => {
    if (!query || query.length < 2) {
      set({ cryptoList: [] });
      return;
    }
    set({ isLoading: true });
    try {
      const response = await apiClient.get(`/crypto/search/${query}`);
      set({ cryptoList: response.data });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Set selected crypto
  setSelectedCrypto: (crypto) => {
    set({ selectedCrypto: crypto });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
