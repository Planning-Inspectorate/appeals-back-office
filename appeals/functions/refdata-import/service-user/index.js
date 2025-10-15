import { EventType } from '@pins/event-client';
import { HTTPError } from 'got';
import api from './back-office-api-client.js';

/**
 * This appears to be unused and the api endpoint does not exist
 * @type {import('@azure/functions').ServiceBusTopicHandler}
 */
export default async function (msg, context) {
	context.info('Service user import command', msg);

	const applicationProperties = context?.triggerMetadata?.applicationProperties;

	const hasType =
		Boolean(applicationProperties) &&
		Object.prototype.hasOwnProperty.call(applicationProperties, 'type');
	if (!hasType) {
		context.warn('Ignoring invalid message, no type', msg);
		return {};
	}

	// @ts-ignore
	const type = applicationProperties?.type;

	if (type !== EventType.Create && type !== EventType.Update) {
		context.warn(`Ignoring invalid message, unsupported type '${type}'`, msg);
		return {};
	}

	try {
		const res = await api.post(msg);

		const { id } = res;

		context.info(`Service user created: ${id}`);
	} catch (e) {
		if (e instanceof HTTPError) {
			context.error('Error creating service user', {
				message: e.message,
				body: e.response?.body
			});
		} else {
			context.error('Error creating service user', e);
		}
		throw e;
	}

	return {};
}
