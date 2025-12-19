import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import config from '@/config/environment';

const pool = new Pool({
	connectionString: config.databaseUrl,
	ssl: config.databaseUrl?.includes('sslmode=require')
		? { rejectUnauthorized: false }
		: undefined,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
	adapter,
	log: config.isDevelopment ? ['warn', 'error'] : ['error'],
});

