import { PrismaClient } from '#db-client';

/** @type {PrismaClient} */
let prismaClient;

/**
 * @returns {PrismaClient}
 */
function createPrismaClient() {
	if (!prismaClient) {
		prismaClient = new PrismaClient({
			// Enable OpenTelemetry tracing for database queries
			log: [
				{ level: 'query', emit: 'event' },
				{ level: 'error', emit: 'stdout' },
				{ level: 'warn', emit: 'stdout' },
				{ level: 'info', emit: 'stdout' }
			]
		});

		// Subscribe to query events for OpenTelemetry tracing
		// This ensures queries are properly captured by the instrumentation
		prismaClient.$on('query', (e) => {
			// Event subscription enables query event emission for tracing
			// The actual tracing is handled by @prisma/instrumentation
			console.log('🔍 Prisma Query executed:', e.query.substring(0, 100) + '...', `Duration: ${e.duration}ms`);
		});

		console.log('✅ Prisma Client initialized with OpenTelemetry support');
	}

	return prismaClient;
}

// Export a getter function instead of the client directly
// This ensures the client is created after instrumentation is initialized
let databaseConnectorInstance;

export const databaseConnector = new Proxy(/** @type {PrismaClient} */ ({}), {
	get: (target, prop) => {
		if (!databaseConnectorInstance) {
			databaseConnectorInstance = createPrismaClient();
		}
		// @ts-ignore
		return databaseConnectorInstance[prop];
	}
});
