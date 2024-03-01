import { LocalEventClient } from './local-event-client.js';
import { ServiceBusEventClient } from './service-bus-event-client.js';

const NSIP_S51_ADVICE = 'nsip-s51-advice';

/**
 * @typedef {Function} InfoFunction
 * @param {string} content
 */

/** @typedef {{info: InfoFunction}} Logger */

/**
 *
 * @param {boolean} serviceBusEnabled
 * @param {any} logger
 * @param {string} serviceBusHostname
 * @returns {ServiceBusEventClient | LocalEventClient}
 */
export const getEventClient = (serviceBusEnabled, logger, serviceBusHostname = '') => {
	return serviceBusEnabled
		? new ServiceBusEventClient(logger, serviceBusHostname)
		: new LocalEventClient(logger);
};

/**
 * gets the name of the schema matching the topic
 *
 * @param {*} topic
 * @returns {string}
 */
export const getSchemaNameFromTopic = (topic) => {
	let schemaName = '';

	switch (topic) {
		case NSIP_S51_ADVICE:
			schemaName = 's51-advice.schema.json';
			break;
		default:
			schemaName = topic + '.schema.json';
			break;
	}

	return schemaName;
};
