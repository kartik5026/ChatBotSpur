import 'dotenv/config';

import app from './app';
import config from '@/config/environment';
import logger from '@/utils/logger';
import { prisma } from '@/models/prisma.model';

// Start server
const server = app.listen(config.port, () => {
	logger.info(`Server running at http://${config.host}:${config.port}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
	logger.info(`${signal} received. Shutting down gracefully...`);
	server.close(() => {
		prisma
			.$disconnect()
			.catch((err: unknown) =>
				logger.error({ err }, 'Failed to disconnect Prisma'),
			)
			.finally(() => {
				logger.info('Server closed.');
				process.exit(0);
			});
	});
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
