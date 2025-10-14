import { EventType } from '@pins/event-client';
import { HTTPError } from 'got';
import api from './back-office-api-client.js';

/**
 *
 * @type {import('@azure/functions').ServiceBusTopicHandler}
 */
export default async function (msg, context) {
	context.log('Representation import command');

	const applicationProperties = context?.triggerMetadata?.applicationProperties;

	const hasType =
		Boolean(applicationProperties) &&
		Object.prototype.hasOwnProperty.call(applicationProperties, 'type');
	if (!hasType) {
		context.warn('Ignoring invalid message, no type');
		return {};
	}

	// @ts-ignore
	const type = applicationProperties?.type;

	if (type !== EventType.Create) {
		context.warn(`Ignoring invalid message, unsupported type '${type}'`);
		return {};
	}

	try {
		const res = await api.post(msg);

		const { id } = res;

		context.info(`Representation added to appeal ID: ${id}`);
	} catch (e) {
		if (e instanceof HTTPError) {
			context.error('Error creating Representation', {
				message: e.message,
				body: e.response?.body
			});
		} else {
			context.error('Error creating Representation', e);
		}
		throw e;
	}

	return {};
}
