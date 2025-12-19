import { Router } from 'express';
import { asyncHandler } from '@/middlewares/asyncHandler';
import * as chatController from '@/controllers/chat.controller';

const router = Router();

router.get('/history', asyncHandler(chatController.getHistory));
router.post('/message', asyncHandler(chatController.postMessage));

export default router;

