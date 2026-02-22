import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { subscribe, unsubscribe, getVapidPublicKey } from '../controllers/push.controller.js';

const router = express.Router();

router.get('/vapid-key', getVapidPublicKey);
router.post('/subscribe', authenticate, subscribe);
router.post('/unsubscribe', authenticate, unsubscribe);

export default router;
