import Watchlist from '../models/Watchlist.js';
import { successResponse } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

export const getWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    console.log('Fetching watchlist for user:', userId);
    let watchlist = await Watchlist.findOne({ userId });

    if (!watchlist) {
      watchlist = await Watchlist.create({ userId, coins: [] });
    }

    res.json(successResponse(watchlist.coins, 'Watchlist fetched'));
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    next(error);
  }
};

export const addToWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { coin } = req.body;
    console.log('Adding to watchlist for user:', userId, 'Coin:', coin?.id);

    if (!coin || !coin.id) {
      return next(new AppError('Coin data is required', 400));
    }

    let watchlist = await Watchlist.findOne({ userId });

    if (!watchlist) {
      watchlist = new Watchlist({ userId, coins: [] });
    }

    const exists = watchlist.coins.some(c => c.coingeckoId === coin.id);
    if (exists) {
      return res.json(successResponse(watchlist.coins, 'Coin already in watchlist'));
    }

    watchlist.coins.push({
      coingeckoId: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      logo: coin.image
    });

    await watchlist.save();
    console.log('Watchlist saved successfully');
    res.json(successResponse(watchlist.coins, 'Added to watchlist'));
  } catch (error) {
    console.error('Watchlist add error:', error);
    next(error);
  }
};

export const removeFromWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { coingeckoId } = req.params;
    console.log('Removing from watchlist for user:', userId, 'Coin:', coingeckoId);

    const watchlist = await Watchlist.findOne({ userId });

    if (!watchlist) {
      return next(new AppError('Watchlist not found', 404));
    }

    watchlist.coins = watchlist.coins.filter(c => c.coingeckoId !== coingeckoId);
    await watchlist.save();

    res.json(successResponse(watchlist.coins, 'Removed from watchlist'));
  } catch (error) {
    console.error('Watchlist remove error:', error);
    next(error);
  }
};
