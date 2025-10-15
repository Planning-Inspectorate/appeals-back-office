/**
 * Azure Monitor OpenTelemetry setup with Prisma instrumentation
 *
 * This file initializes Azure Monitor with OpenTelemetry for the API.
 * It's loaded via Node's --import flag to ensure it runs before any application code.
 *
 * IMPORTANT: This must run before any Prisma Client is instantiated!
 */

import { useAzureMonitor } from '@azure/monitor-opentelemetry';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { loadEnvironment } from '@pins/platform';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, '..'); // api package root, where .env files live

// Load environment variables
const environment = loadEnvironment(process.env.NODE_ENV, apiDir);

const connectionString = environment.APPLICATIONINSIGHTS_CONNECTION_STRING;

if (connectionString) {
	try {
		console.log('🚀 Initializing Azure Monitor OpenTelemetry with Prisma instrumentation...');

		// Initialize Azure Monitor with Prisma instrumentation included
		// This ensures database queries are automatically traced and correlated with HTTP requests
		useAzureMonitor({
			azureMonitorExporterOptions: {
				connectionString: connectionString
			},
			enableLiveMetrics: true,
			enableStandardMetrics: true,
			samplingRatio: 1.0,
			// Include Prisma instrumentation to capture database queries
			instrumentations: [
				new PrismaInstrumentation({
					// Enable middleware for comprehensive query capture
					middleware: true
				})
			]
		});

		console.log('✅ Azure Monitor OpenTelemetry initialized successfully');
		console.log('📊 Prisma instrumentation enabled - database queries will be correlated with HTTP requests');

	} catch (error) {
		console.warn('❌ Failed to initialize Azure Monitor OpenTelemetry:', error);
		console.error('Full error details:', error);
	}
} else {
	console.warn(
		'Skipped initialising Azure Monitor OpenTelemetry because `APPLICATIONINSIGHTS_CONNECTION_STRING` is undefined. If running locally, this is expected.'
	);
}

