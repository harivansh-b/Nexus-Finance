import express from 'express';
import * as watchlistController from '../controllers/watchlistController.js';
import { verifyToken } from '../middleware/auth.js';
import { tradeLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', watchlistController.getWatchlist);
router.post('/add', tradeLimiter, watchlistController.addToWatchlist);
router.delete('/:coingeckoId', tradeLimiter, watchlistController.removeFromWatchlist);

export default router;
