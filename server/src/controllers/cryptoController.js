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

const fallbackCryptoSeed = [
  ['bitcoin', 'btc', 'Bitcoin', 65000, 1280000000000],
  ['ethereum', 'eth', 'Ethereum', 3500, 420000000000],
  ['tether', 'usdt', 'Tether', 1, 112000000000],
  ['binancecoin', 'bnb', 'BNB', 590, 91000000000],
  ['solana', 'sol', 'Solana', 145, 67000000000],
  ['ripple', 'xrp', 'XRP', 0.52, 29000000000],
  ['usd-coin', 'usdc', 'USDC', 1, 32000000000],
  ['staked-ether', 'steth', 'Lido Staked Ether', 3500, 33000000000],
  ['dogecoin', 'doge', 'Dogecoin', 0.13, 19000000000],
  ['cardano', 'ada', 'Cardano', 0.45, 16000000000],
  ['tron', 'trx', 'TRON', 0.12, 11000000000],
  ['avalanche-2', 'avax', 'Avalanche', 32, 12000000000],
  ['shiba-inu', 'shib', 'Shiba Inu', 0.000023, 13500000000],
  ['wrapped-bitcoin', 'wbtc', 'Wrapped Bitcoin', 65000, 10000000000],
  ['chainlink', 'link', 'Chainlink', 15, 9000000000],
  ['polkadot', 'dot', 'Polkadot', 6.5, 8500000000],
  ['bitcoin-cash', 'bch', 'Bitcoin Cash', 430, 8400000000],
  ['near', 'near', 'NEAR Protocol', 5.2, 5600000000],
  ['polygon', 'matic', 'Polygon', 0.72, 6900000000],
  ['litecoin', 'ltc', 'Litecoin', 78, 5800000000],
  ['uniswap', 'uni', 'Uniswap', 9.5, 5700000000],
  ['internet-computer', 'icp', 'Internet Computer', 9.4, 4400000000],
  ['dai', 'dai', 'Dai', 1, 5300000000],
  ['aptos', 'apt', 'Aptos', 8.1, 3600000000],
  ['ethereum-classic', 'etc', 'Ethereum Classic', 26, 3800000000],
  ['stellar', 'xlm', 'Stellar', 0.1, 2900000000],
  ['cosmos', 'atom', 'Cosmos Hub', 7.2, 2800000000],
  ['filecoin', 'fil', 'Filecoin', 5.1, 2900000000],
  ['render-token', 'rndr', 'Render', 7.5, 2900000000],
  ['mantle', 'mnt', 'Mantle', 0.82, 2700000000],
  ['arbitrum', 'arb', 'Arbitrum', 0.95, 2600000000],
  ['hedera-hashgraph', 'hbar', 'Hedera', 0.08, 2800000000],
  ['vechain', 'vet', 'VeChain', 0.03, 2200000000],
  ['maker', 'mkr', 'Maker', 2600, 2400000000],
  ['optimism', 'op', 'Optimism', 2.1, 2300000000],
  ['injective-protocol', 'inj', 'Injective', 23, 2200000000],
  ['the-graph', 'grt', 'The Graph', 0.24, 2200000000],
  ['immutable-x', 'imx', 'Immutable', 1.6, 2300000000],
  ['crypto-com-chain', 'cro', 'Cronos', 0.09, 2300000000],
  ['aave', 'aave', 'Aave', 100, 1500000000],
  ['algorand', 'algo', 'Algorand', 0.18, 1500000000],
  ['fantom', 'ftm', 'Fantom', 0.55, 1550000000],
  ['theta-token', 'theta', 'Theta Network', 1.5, 1500000000],
  ['flow', 'flow', 'Flow', 0.68, 1000000000],
  ['elrond-erd-2', 'egld', 'MultiversX', 34, 950000000],
  ['tezos', 'xtz', 'Tezos', 0.92, 900000000],
  ['axie-infinity', 'axs', 'Axie Infinity', 6.5, 930000000],
  ['the-sandbox', 'sand', 'The Sandbox', 0.42, 940000000],
  ['decentraland', 'mana', 'Decentraland', 0.4, 760000000],
  ['eos', 'eos', 'EOS', 0.72, 800000000],
];

const fallbackCryptoImages = {
  bitcoin: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  ethereum: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  tether: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
  binancecoin: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  solana: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  ripple: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
};

const fallbackCryptoList = fallbackCryptoSeed.map(([id, symbol, name, price, marketCap], index) => ({
  id,
  symbol,
  name,
  image: fallbackCryptoImages[id] || null,
  current_price: price,
  market_cap: marketCap,
  market_cap_rank: index + 1,
  price_change_percentage_24h: Number((Math.sin(index + 1) * 3).toFixed(2)),
  total_volume: Math.max(Math.round(marketCap * (0.02 + (index % 5) * 0.01)), 10000000),
})).map((coin) => ({
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
