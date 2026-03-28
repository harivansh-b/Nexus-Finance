import axios from 'axios';
import { successResponse } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const cache = new Map();
const CACHE_DURATION = 5000; // 5 seconds

// Get cached data or fetch new
const getCachedData = async (key, fetcher) => {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const data = await fetcher();
    cache.set(key, { data, timestamp: now });
    return data;
  } catch (error) {
    if (cached) {
      console.warn(`Using stale cache for ${key} due to API error`);
      return cached.data;
    }
    throw error;
  }
};

// Get top cryptocurrencies
export const getCryptoList = async (req, res, next) => {
  try {
    const { limit = 50, order = 'market_cap_desc' } = req.query;

    const data = await getCachedData('crypto_list', async () => {
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order,
          per_page: Math.min(limit, 250),
          page: 1,
          sparkline: true,
          price_change_percentage: '24h',
        },
      });
      return response.data;
    });

    const formatted = data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol?.toUpperCase(),
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      marketCapRank: coin.market_cap_rank,
      change24h: coin.price_change_percentage_24h,
      volume24h: coin.total_volume,
      sparkline: coin.sparkline_in_7d?.price || [],
    }));

    res.json(successResponse(formatted, 'Cryptocurrency list fetched'));
  } catch (error) {
    next(error);
  }
};

// Get single crypto details
export const getCryptoDetails = async (req, res, next) => {
  try {
    const { coingeckoId } = req.params;

    const data = await getCachedData(`crypto_${coingeckoId}`, async () => {
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${coingeckoId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
        },
      });
      return response.data;
    });

    const formatted = {
      id: data.id,
      symbol: data.symbol?.toUpperCase(),
      name: data.name,
      image: data.image?.large,
      description: data.description?.en,
      currentPrice: data.market_data?.current_price?.usd,
      marketCap: data.market_data?.market_cap?.usd,
      volume24h: data.market_data?.total_volume?.usd,
      change24h: data.market_data?.price_change_percentage_24h,
      change7d: data.market_data?.price_change_percentage_7d,
      change30d: data.market_data?.price_change_percentage_30d,
      ath: data.market_data?.ath?.usd,
      atl: data.market_data?.atl?.usd,
      circulatingSupply: data.market_data?.circulating_supply,
      totalSupply: data.market_data?.total_supply,
      maxSupply: data.market_data?.max_supply,
    };

    res.json(successResponse(formatted, 'Cryptocurrency details fetched'));
  } catch (error) {
    next(error);
  }
};

// Search cryptocurrencies
export const searchCrypto = async (req, res, next) => {
  try {
    const { query } = req.params;

    if (!query || query.length < 2) {
      return res.json(successResponse([], 'Query too short'));
    }

    const allCryptos = await getCachedData('crypto_search_data', async () => {
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
        },
      });
      return response.data;
    });

    const filtered = allCryptos.filter(
      (coin) =>
        coin.name.toLowerCase().includes(query.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(query.toLowerCase())
    );

    const results = filtered.slice(0, 20).map((coin) => ({
      id: coin.id,
      symbol: coin.symbol?.toUpperCase(),
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
    }));

    res.json(successResponse(results, 'Search results'));
  } catch (error) {
    next(error);
  }
};

// Get price history for charts
export const getPriceHistory = async (req, res, next) => {
  try {
    const { coingeckoId } = req.params;
    const { days = 30 } = req.query;

    const data = await getCachedData(`crypto_history_${coingeckoId}_${days}`, async () => {
      const response = await axios.get(
        `${COINGECKO_BASE_URL}/coins/${coingeckoId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days,
            interval: 'daily',
          },
        }
      );
      return response.data;
    });

    const formatted = data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    }));

    res.json(successResponse(formatted, 'Price history fetched'));
  } catch (error) {
    next(error);
  }
};
