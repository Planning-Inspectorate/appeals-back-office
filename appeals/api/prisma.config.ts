import { defineConfig } from 'prisma/config';

// load from .env file
// prettier-ignore
try { require('node:process').loadEnvFile(); } catch {/* ignore errors*/}

export default defineConfig({
	schema: './src/database/schema.prisma',
	migrations: {
		path: './src/database/migrations',
		seed: 'node src/database/seed/seed-development.js'
	},
	datasource: {
		url: process.env.DATABASE_URL || ''
	}
});
