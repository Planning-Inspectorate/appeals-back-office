import { EventType } from '@pins/event-client';
import { HTTPError } from 'got';
import api from './back-office-api-client.js';

/**
 *
 * @type {import('@azure/functions').ServiceBusTopicHandler}
 */
export default async function (msg, context) {
	context.log('Listed Building import command', msg);

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

	try {
		if (type === EventType.Create || type === EventType.Update) {
			await api.upsertRecord(msg);
		}

		if (type === EventType.Delete) {
			// @ts-ignore
			await api.deleteRecord(msg['reference']);
		}
	} catch (e) {
		if (e instanceof HTTPError) {
			context.error('Error modifying listed building data', {
				message: e.message,
				body: e.response?.body
			});
		} else {
			context.error('Error modifying listed building data', e);
		}
		throw e;
	}

	return {};
}
