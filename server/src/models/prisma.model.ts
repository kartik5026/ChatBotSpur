import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import config from '@/config/environment';
import dns from 'node:dns';

// Render commonly has no IPv6 egress. Prefer IPv4 when DNS returns both A/AAAA.
// This prevents errors like ENETUNREACH <ipv6>:5432.
dns.setDefaultResultOrder('ipv4first');

function createPgPool() {
	if (!config.databaseUrl) {
		throw new Error('DATABASE_URL is not set');
	}

	// Parse DATABASE_URL ourselves so we can force IPv4 resolution.
	const url = new URL(config.databaseUrl);

	const ssl =
		url.searchParams.get('sslmode') === 'require' ||
		config.databaseUrl.includes('sslmode=require')
			? { rejectUnauthorized: false }
			: undefined;

	// `lookup` is a valid Node net.connect option that `pg` forwards, but it's not in pg's TS types.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const poolConfig: any = {
		host: url.hostname,
		port: url.port ? Number(url.port) : 5432,
		user: decodeURIComponent(url.username),
		password: decodeURIComponent(url.password),
		database: url.pathname.replace(/^\//, ''),
		ssl,
		// Force IPv4 lookup to avoid Render IPv6 egress issues
		lookup: (hostname: string, options: unknown, cb: unknown) =>
			dns.lookup(hostname, { ...(options as object), family: 4 }, cb as any),
	};

	return new Pool(poolConfig);
}

const pool = createPgPool();

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
	adapter,
	log: config.isDevelopment ? ['warn', 'error'] : ['error'],
});

