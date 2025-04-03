const appInsights = require('applicationinsights');
const logger = require('./lib/logger');
const server = require('./server');

try {
	appInsights.setup().setAutoDependencyCorrelation(true).setSendLiveMetrics(true);
	appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] =
		'pdf-service-api';
	appInsights.start();
} catch (err) {
	logger.warn({ err }, 'Application insights failed to start: ');
}

const main = async () => {
	server();
};

main().catch((err) => {
	logger.fatal({ err }, 'Unable to start application');
});
