import {Router} from 'express';
import {
    getNotifications,
    clearAll,
} from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/notifications
router.get('/get-notifications', authenticate, getNotifications);
router.delete('/clear-all', authenticate, clearAll);

export default router;