import { EventType } from '@pins/event-client';
import api from './back-office-api-client.js';
import { HTTPError } from 'got';

/**
 *
 * @param {import('@azure/functions').Context} context
 * @param {*} msg
 */
export default async function (context, msg) {
	context.log('Listed Building import command', msg);

	const applicationProperties = context?.bindingData?.applicationProperties;

	const hasType =
		Boolean(applicationProperties) &&
		Object.prototype.hasOwnProperty.call(applicationProperties, 'type');
	if (!hasType) {
		context.log.warn('Ignoring invalid message, no type', msg);
		return;
	}

	const type = applicationProperties?.type;

	try {
		if (type === EventType.Create || type === EventType.Update) {
			await api.upsertRecord(msg);
		}

		if (type === EventType.Delete) {
			await api.deleteRecord(msg['reference']);
		}
	} catch (e) {
		if (e instanceof HTTPError) {
			context.log.error('Error modifying listed building data', {
				message: e.message,
				body: e.response?.body
			});
		} else {
			context.log.error('Error modifying listed building data', e);
		}
		throw e;
	}
}
