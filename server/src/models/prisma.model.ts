import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import config from '@/config/environment';
import dns from 'node:dns';
import net from 'node:net';

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

	// Force IPv4 at the socket level. pg internally calls `socket.connect(port, host)`
	// (without passing family options), so we override connect() to prefer IPv4.
	const stream = () => {
		const socket = new net.Socket();
		const originalConnect = socket.connect.bind(socket);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(socket as any).connect = (port: number, host: string) =>
			originalConnect({ port, host, family: 4 });
		return socket;
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const poolConfig: any = {
		host: url.hostname,
		port: url.port ? Number(url.port) : 5432,
		user: decodeURIComponent(url.username),
		password: decodeURIComponent(url.password),
		database: url.pathname.replace(/^\//, ''),
		ssl,
		stream,
	};

	return new Pool(poolConfig);
}

const pool = createPgPool();

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
	adapter,
	log: config.isDevelopment ? ['warn', 'error'] : ['error'],
});

