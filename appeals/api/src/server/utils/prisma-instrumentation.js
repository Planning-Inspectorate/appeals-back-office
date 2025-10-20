import { AzureMonitorTraceExporter } from '@azure/monitor-opentelemetry-exporter';
import { trace } from '@opentelemetry/api';
import { BasicTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import logger from '#utils/logger.js';
import config from '../config/config.js';

export function initialisePrismaInstrumentation() {
	if (!config.APPLICATIONINSIGHTS_CONNECTION_STRING) {
		logger.warn(
			'Skipped initialising Prisma instrumentation as `APPLICATIONINSIGHTS_CONNECTION_STRING` is undefined. If running locally, this is expected.'
		);
		return;
	}

	const exporter = new AzureMonitorTraceExporter({
		connectionString: config.APPLICATIONINSIGHTS_CONNECTION_STRING
	});

	const provider = new BasicTracerProvider({
		resource: resourceFromAttributes({
			[SEMRESATTRS_SERVICE_NAME]: 'back-office-prisma'
		}),
		spanProcessors: [new BatchSpanProcessor(exporter)]
	});

	trace.setGlobalTracerProvider(provider);

	registerInstrumentations({
		tracerProvider: provider,
		instrumentations: [new PrismaInstrumentation()]
	});

	logger.info('Successfully initialised Prisma instrumentation.');
}

