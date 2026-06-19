import axios from 'axios';
import { successResponse } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const cache = new Map();
const pendingRequests = new Map();
const MARKET_CACHE_DURATION = 60 * 1000;
const HISTORY_CACHE_DURATION = 5 * 60 * 1000;

const getUpstreamStatus = (error) => error.response?.status || error.status;
const isProviderBusy = (error) => error.statusCode === 503 || getUpstreamStatus(error) === 429;

const buildSparkline = (price, changePercent = 0) => {
  const points = 24;
  const start = price / (1 + changePercent / 100 || 1);

  return Array.from({ length: points }, (_, index) => {
    const progress = index / (points - 1);
    const wave = Math.sin(index * 0.8) * price * 0.004;
    return Number((start + (price - start) * progress + wave).toFixed(2));
  });
};

const fallbackCryptoList = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 65000,
    market_cap: 1280000000000,
    market_cap_rank: 1,
    price_change_percentage_24h: 1.8,
    total_volume: 32000000000,
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3500,
    market_cap: 420000000000,
    market_cap_rank: 2,
    price_change_percentage_24h: 1.2,
    total_volume: 17000000000,
  },
  {
    id: 'tether',
    symbol: 'usdt',
    name: 'Tether',
    image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    current_price: 1,
    market_cap: 112000000000,
    market_cap_rank: 3,
    price_change_percentage_24h: 0.01,
    total_volume: 52000000000,
  },
  {
    id: 'binancecoin',
    symbol: 'bnb',
    name: 'BNB',
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    current_price: 590,
    market_cap: 91000000000,
    market_cap_rank: 4,
    price_change_percentage_24h: 0.7,
    total_volume: 1700000000,
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    current_price: 145,
    market_cap: 67000000000,
    market_cap_rank: 5,
    price_change_percentage_24h: 2.4,
    total_volume: 3100000000,
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    current_price: 0.52,
    market_cap: 29000000000,
    market_cap_rank: 6,
    price_change_percentage_24h: -0.4,
    total_volume: 1100000000,
  },
].map((coin) => ({
  ...coin,
  sparkline_in_7d: {
    price: buildSparkline(coin.current_price, coin.price_change_percentage_24h),
  },
}));

const formatCryptoList = (data) =>
  data.map((coin) => ({
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

// Get cached data or fetch new
const getCachedData = async (key, fetcher, cacheDuration = MARKET_CACHE_DURATION) => {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.timestamp < cacheDuration) {
    return cached.data;
  }

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const request = fetcher()
    .then((data) => {
      cache.set(key, { data, timestamp: Date.now() });
      return data;
    })
    .catch((error) => {
      if (cached) {
        console.warn(`Using stale cache for ${key} due to API error`);
        return cached.data;
      }

      if (getUpstreamStatus(error) === 429) {
        throw new AppError('Market data provider is busy. Please try again shortly.', 503);
      }

      throw error;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, request);
  return request;
};

const fetchCoinGecko = async (path, params) => {
  try {
    const response = await axios.get(`${COINGECKO_BASE_URL}${path}`, { params });
    return response.data;
  } catch (error) {
    if (getUpstreamStatus(error) === 429) {
      throw new AppError('Market data provider is busy. Please try again shortly.', 503);
    }
    throw error;
  }
};

// Get top cryptocurrencies
export const getCryptoList = async (req, res, next) => {
  try {
    const { limit = 50, order = 'market_cap_desc' } = req.query;

    const data = await getCachedData('crypto_list', async () => {
      return fetchCoinGecko('/coins/markets', {
        vs_currency: 'usd',
        order,
        per_page: Math.min(limit, 250),
        page: 1,
        sparkline: true,
        price_change_percentage: '24h',
      });
    });

    const formatted = formatCryptoList(data);

    res.json(successResponse(formatted, 'Cryptocurrency list fetched'));
  } catch (error) {
    if (isProviderBusy(error)) {
      cache.set('crypto_list', { data: fallbackCryptoList, timestamp: Date.now() });
      return res.json(successResponse(formatCryptoList(fallbackCryptoList), 'Fallback cryptocurrency list fetched'));
    }

    next(error);
  }
};

// Get single crypto details
export const getCryptoDetails = async (req, res, next) => {
  try {
    const { coingeckoId } = req.params;

    const data = await getCachedData(`crypto_${coingeckoId}`, async () => {
      return fetchCoinGecko(`/coins/${coingeckoId}`, {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
      });
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
      return fetchCoinGecko('/coins/markets', {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
      });
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
      return fetchCoinGecko(`/coins/${coingeckoId}/market_chart`, {
        vs_currency: 'usd',
        days,
        interval: 'daily',
      });
    }, HISTORY_CACHE_DURATION);

    const formatted = data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    }));

    res.json(successResponse(formatted, 'Price history fetched'));
  } catch (error) {
    next(error);
  }
};
