import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Watchlist from '../models/Watchlist.js';
import { successResponse } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';
import axios from 'axios';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const priceCache = new Map();
const PRICE_CACHE_DURATION = 60 * 1000;

const getCachedPrice = (coingeckoId) => {
  const cached = priceCache.get(coingeckoId);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > PRICE_CACHE_DURATION) {
    return null;
  }

  return cached.price;
};

const setCachedPrice = (coingeckoId, price) => {
  if (typeof price === 'number' && Number.isFinite(price) && price > 0) {
    priceCache.set(coingeckoId, { price, timestamp: Date.now() });
  }
};

const fetchPriceFromSimpleEndpoint = async (coingeckoId) => {
  const response = await axios.get(`${COINGECKO_BASE_URL}/simple/price`, {
    params: {
      ids: coingeckoId,
      vs_currencies: 'usd',
    },
    timeout: 12000,
  });

  return response.data?.[coingeckoId]?.usd || null;
};

const fetchPriceFromCoinDetails = async (coingeckoId) => {
  const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${coingeckoId}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
    },
    timeout: 12000,
  });

  return response.data?.market_data?.current_price?.usd || null;
};

const getCryptoPrice = async (coingeckoId, fallbackPrice = null) => {
  const cached = getCachedPrice(coingeckoId);
  if (cached) {
    return cached;
  }

  try {
    let price = await fetchPriceFromSimpleEndpoint(coingeckoId);

    if (!price) {
      price = await fetchPriceFromCoinDetails(coingeckoId);
    }

    if (typeof price === 'number' && Number.isFinite(price) && price > 0) {
      setCachedPrice(coingeckoId, price);
      return price;
    }
  } catch (error) {
    const stalePrice = priceCache.get(coingeckoId)?.price;
    if (stalePrice) {
      return stalePrice;
    }
  }

  if (typeof fallbackPrice === 'number' && Number.isFinite(fallbackPrice) && fallbackPrice > 0) {
    return fallbackPrice;
  }

  throw new AppError(`Failed to fetch current price for ${coingeckoId}`, 500);
};

// Buy Crypto
export const buyCrypto = async (req, res, next) => {
  try {
    const { coingeckoId, amount, coinName, coinSymbol } = req.body;
    const userId = req.user.userId;

    if (!coingeckoId || !amount || amount <= 0) {
      throw new AppError('Invalid purchase parameters', 400);
    }

    const currentPrice = await getCryptoPrice(coingeckoId);
    if (!currentPrice) {
      throw new AppError('Failed to fetch crypto price', 400);
    }

    const totalCost = amount * currentPrice;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.balance < totalCost) {
      throw new AppError('Insufficient balance', 400);
    }

    const balanceBefore = user.balance;
    user.balance -= totalCost;
    await user.save();

    let portfolio = await Portfolio.findOne({
      userId,
      'coin.coingeckoId': coingeckoId,
    });

    if (portfolio) {
      const totalInvested = portfolio.totalInvested + totalCost;
      portfolio.amount += amount;
      portfolio.avgBuyPrice = totalInvested / portfolio.amount;
      portfolio.totalInvested = totalInvested;
    } else {
      portfolio = new Portfolio({
        userId,
        coin: {
          name: coinName,
          symbol: coinSymbol.toUpperCase(),
          coingeckoId,
        },
        amount,
        avgBuyPrice: currentPrice,
        totalInvested: totalCost,
      });
    }

    portfolio.lastBuyPrice = currentPrice;
    portfolio.lastBuyAt = new Date();
    await portfolio.save();

    const transaction = new Transaction({
      userId,
      type: 'BUY',
      coin: {
        name: coinName,
        symbol: coinSymbol.toUpperCase(),
        coingeckoId,
      },
      amount,
      price: currentPrice,
      totalValue: totalCost,
      status: 'COMPLETED',
      balanceBefore,
      balanceAfter: user.balance,
    });
    await transaction.save();

    res.status(201).json(
      successResponse(
        {
          transaction,
          portfolio,
          newBalance: user.balance,
        },
        'Crypto purchased successfully',
        201
      )
    );
  } catch (error) {
    next(error);
  }
};

// Sell Crypto
export const sellCrypto = async (req, res, next) => {
  try {
    const { coingeckoId, amount } = req.body;
    const userId = req.user.userId;

    if (!coingeckoId || !amount || amount <= 0) {
      throw new AppError('Invalid sell parameters', 400);
    }

    const portfolio = await Portfolio.findOne({
      userId,
      'coin.coingeckoId': coingeckoId,
    });

    if (!portfolio) {
      throw new AppError('Crypto not in portfolio', 404);
    }

    if (portfolio.amount < amount) {
      throw new AppError('Insufficient crypto balance', 400);
    }

    const currentPrice = await getCryptoPrice(
      coingeckoId,
      portfolio.lastBuyPrice || portfolio.avgBuyPrice
    );

    if (!currentPrice) {
      throw new AppError('Failed to fetch crypto price', 400);
    }

    const totalEarnings = amount * currentPrice;

    const user = await User.findById(userId);
    const balanceBefore = user.balance;
    user.balance += totalEarnings;
    await user.save();

    portfolio.amount -= amount;
    if (portfolio.amount === 0) {
      await Portfolio.deleteOne({ _id: portfolio._id });
    } else {
      await portfolio.save();
    }

    const transaction = new Transaction({
      userId,
      type: 'SELL',
      coin: portfolio.coin,
      amount,
      price: currentPrice,
      totalValue: totalEarnings,
      status: 'COMPLETED',
      balanceBefore,
      balanceAfter: user.balance,
    });
    await transaction.save();

    res.json(
      successResponse(
        {
          transaction,
          portfolio: portfolio.amount > 0 ? portfolio : null,
          newBalance: user.balance,
        },
        'Crypto sold successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get Portfolio
export const getPortfolio = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const portfolio = await Portfolio.find({ userId });
    res.json(successResponse(portfolio, 'Portfolio fetched'));
  } catch (error) {
    next(error);
  }
};

// Get Portfolio Summary
export const getPortfolioSummary = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const portfolio = await Portfolio.find({ userId });

    let totalValue = 0;
    let totalInvested = 0;

    for (const item of portfolio) {
      const currentPrice = await getCryptoPrice(
        item.coin.coingeckoId,
        item.lastBuyPrice || item.avgBuyPrice
      );
      const itemValue = item.amount * currentPrice;
      totalValue += itemValue;
      totalInvested += item.totalInvested;
    }

    const user = await User.findById(userId);

    const profitLoss = totalValue - totalInvested;
    const profitLossPercentage =
      totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    res.json(
      successResponse(
        {
          holdings: portfolio.length,
          totalInvested,
          totalValue,
          profitLoss,
          profitLossPercentage: profitLossPercentage.toFixed(2),
          cashBalance: user.balance,
          totalBalance: user.balance + totalValue,
        },
        'Portfolio summary fetched'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get Transactions
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, page = 1, type } = req.query;

    const skip = (page - 1) * limit;
    const query = { userId };
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json(
      successResponse(
        {
          transactions,
          pagination: { page: parseInt(page), limit: parseInt(limit), total },
        },
        'Transactions fetched'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get Transaction by ID
export const getTransactionById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const transaction = await Transaction.findOne({
      _id: req.params.transactionId,
      userId,
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    res.json(successResponse(transaction, 'Transaction fetched'));
  } catch (error) {
    next(error);
  }
};

// Get Watchlist
export const getWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    let watchlist = await Watchlist.findOne({ userId });

    if (!watchlist) {
      watchlist = new Watchlist({ userId, coins: [] });
      await watchlist.save();
    }

    res.json(successResponse(watchlist.coins, 'Watchlist fetched'));
  } catch (error) {
    next(error);
  }
};

// Add to Watchlist
export const addToWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { coinName, coinSymbol, coingeckoId, logo } = req.body;

    let watchlist = await Watchlist.findOne({ userId });
    if (!watchlist) {
      watchlist = new Watchlist({ userId, coins: [] });
    }

    const exists = watchlist.coins.some((c) => c.coingeckoId === coingeckoId);
    if (exists) {
      throw new AppError('Coin already in watchlist', 400);
    }

    watchlist.coins.push({
      name: coinName,
      symbol: coinSymbol,
      coingeckoId,
      logo,
    });

    await watchlist.save();
    res.json(successResponse(watchlist.coins, 'Coin added to watchlist'));
  } catch (error) {
    next(error);
  }
};

// Remove from Watchlist
export const removeFromWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { coingeckoId } = req.body;

    const watchlist = await Watchlist.findOne({ userId });
    if (!watchlist) {
      throw new AppError('Watchlist not found', 404);
    }

    watchlist.coins = watchlist.coins.filter(
      (c) => c.coingeckoId !== coingeckoId
    );

    await watchlist.save();
    res.json(successResponse(watchlist.coins, 'Coin removed from watchlist'));
  } catch (error) {
    next(error);
  }
};

// Get Orders (Advanced - placeholder)
export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId });
    res.json(successResponse(orders, 'Orders fetched'));
  } catch (error) {
    next(error);
  }
};

// Create Order (Advanced - placeholder)
export const createOrder = async (req, res, next) => {
  try {
    throw new AppError('Advanced orders coming soon', 501);
  } catch (error) {
    next(error);
  }
};

// Cancel Order (Advanced - placeholder)
export const cancelOrder = async (req, res, next) => {
  try {
    throw new AppError('Advanced orders coming soon', 501);
  } catch (error) {
    next(error);
  }
};

// Add Funds
export const addFunds = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      throw new AppError('Invalid amount', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const balanceBefore = user.balance;
    user.balance += amount;
    await user.save();

    const transaction = new Transaction({
      userId,
      type: 'DEPOSIT',
      amount,
      price: 1,
      totalValue: amount,
      status: 'COMPLETED',
      balanceBefore,
      balanceAfter: user.balance,
      description: 'Deposit via payment method',
    });
    await transaction.save();

    res.json(
      successResponse(
        {
          newBalance: user.balance,
          transaction,
        },
        'Funds added successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};
