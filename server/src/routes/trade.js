import express from 'express';
import * as tradeController from '../controllers/tradeController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - require authentication
router.use(verifyToken);

// Buy crypto
router.post('/buy', tradeController.buyCrypto);

// Sell crypto
router.post('/sell', tradeController.sellCrypto);

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
router.post('/watchlist/add', tradeController.addToWatchlist);
router.post('/watchlist/remove', tradeController.removeFromWatchlist);

// Orders
router.get('/orders', tradeController.getOrders);
router.post('/orders/create', tradeController.createOrder);
router.post('/orders/:orderId/cancel', tradeController.cancelOrder);

// Add funds
router.post('/add-funds', tradeController.addFunds);

export default router;
