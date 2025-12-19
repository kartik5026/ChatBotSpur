import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import config from '@/config/environment';
import dns from 'node:dns';

// Render commonly has no IPv6 egress. Prefer IPv4 when DNS returns both A/AAAA.
// This prevents errors like ENETUNREACH <ipv6>:5432.
dns.setDefaultResultOrder('ipv4first');

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

