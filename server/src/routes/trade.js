import express from 'express';
import * as tradeController from '../controllers/tradeController.js';
import { verifyToken } from '../middleware/auth.js';
import { tradeLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Protected routes - require authentication
router.use(verifyToken);

// Buy crypto
router.post('/buy', tradeLimiter, tradeController.buyCrypto);

// Sell crypto
router.post('/sell', tradeLimiter, tradeController.sellCrypto);

// Get user portfolio
router.get('/portfolio', tradeController.getPortfolio);

// Get portfolio value summary
router.get('/portfolio/summary', tradeController.getPortfolioSummary);

// Get transaction history
router.get('/transactions', tradeController.getTransactions);

// Get specific transaction
router.get('/transactions/:transactionId', tradeController.getTransactionById);

// Watchlist
router.get('/watchlist', tradeController.getWatchlist);
router.post('/watchlist/add', tradeLimiter, tradeController.addToWatchlist);
router.post('/watchlist/remove', tradeLimiter, tradeController.removeFromWatchlist);

// Orders
router.get('/orders', tradeController.getOrders);
router.post('/orders/create', tradeLimiter, tradeController.createOrder);
router.post('/orders/:orderId/cancel', tradeLimiter, tradeController.cancelOrder);

// Add funds
router.post('/add-funds', tradeLimiter, tradeController.addFunds);

export default router;
