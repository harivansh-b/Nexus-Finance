import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, chatController.chatWithAI);

export default router;
