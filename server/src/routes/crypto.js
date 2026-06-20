import express from 'express';
import * as cryptoController from '../controllers/cryptoController.js';
import { optionalAuth } from '../middleware/auth.js';
import { cryptoLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(cryptoLimiter);

// Get top cryptocurrencies
router.get('/list', cryptoController.getCryptoList);

// Get trending cryptocurrencies
router.get('/trending', cryptoController.getTrendingCoins);

// Search cryptocurrencies
router.get('/search/:query', cryptoController.searchCrypto);

// Get crypto price history (for charts)
router.get('/:coingeckoId/history', cryptoController.getPriceHistory);

// Get single crypto details
router.get('/:coingeckoId', cryptoController.getCryptoDetails);

export default router;
