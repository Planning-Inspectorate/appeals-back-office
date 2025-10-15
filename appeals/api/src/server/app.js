import fs from 'node:fs';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';
import { buildApp } from './build-app.js';
import config from './config/config.js';

// OpenTelemetry instrumentation (including Azure Monitor and Prisma)
// is now loaded via --import flag in package.json scripts

const app = buildApp((expressApp) => {
	// @ts-ignore
	const swaggerAuto = JSON.parse(fs.readFileSync(path.resolve(config.SWAGGER_JSON_DIR)));

	// @ts-ignore
	expressApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerAuto));
});

export { app };
