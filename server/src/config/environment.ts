import 'dotenv/config';

const config = {
	env: process.env.NODE_ENV || 'development',
	port: parseInt(process.env.PORT || '4000'),
	host: process.env.HOST || 'localhost',
	clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
	logLevel: process.env.LOG_LEVEL || 'info',
	databaseUrl: process.env.DATABASE_URL,
	groqApiKey: process.env.GROQ_API_KEY,

	isDevelopment: process.env.NODE_ENV === 'development',
	isProduction: process.env.NODE_ENV === 'production',
	isTest: process.env.NODE_ENV === 'test',
} as const;

export default config;
