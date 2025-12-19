import { Router, type Request, type Response } from 'express';
import chatRoutes from './chat.routes';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) =>
	res.status(200).json({
		status: 'OK',
		timestamp: new Date().toISOString(),
	}),
);

// All other route groups
router.use('/chat', chatRoutes);

export default router;
