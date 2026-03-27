import express from 'express';
import * as cryptoController from '../controllers/cryptoController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get top cryptocurrencies
router.get('/list', cryptoController.getCryptoList);

// Get single crypto details
router.get('/:coingeckoId', cryptoController.getCryptoDetails);

// Search cryptocurrencies
router.get('/search/:query', cryptoController.searchCrypto);

// Get crypto price history (for charts)
router.get('/:coingeckoId/history', cryptoController.getPriceHistory);

export default router;
