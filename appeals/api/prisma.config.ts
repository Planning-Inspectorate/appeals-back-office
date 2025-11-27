import 'dotenv/config';
import { defineConfig } from 'prisma/config';

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
