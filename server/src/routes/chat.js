import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { verifyToken } from '../middleware/auth.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', verifyToken, chatLimiter, chatController.chatWithAI);

export default router;
