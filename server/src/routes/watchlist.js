import express from 'express';
import * as watchlistController from '../controllers/watchlistController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', watchlistController.getWatchlist);
router.post('/add', watchlistController.addToWatchlist);
router.delete('/:coingeckoId', watchlistController.removeFromWatchlist);

export default router;
