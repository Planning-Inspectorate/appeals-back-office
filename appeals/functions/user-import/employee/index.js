import { EventType } from '@pins/event-client';
import api from './back-office-api-client.js';
import { HTTPError } from 'got';

/**
 *
 * @param {import('@azure/functions').Context} context
 * @param {*} msg
 */
export default async function (context, msg) {
	context.log('Employee import command', msg);

	const applicationProperties = context?.bindingData?.applicationProperties;

	const hasType =
		Boolean(applicationProperties) &&
		Object.prototype.hasOwnProperty.call(applicationProperties, 'type');
	if (!hasType) {
		context.log.warn('Ignoring invalid message, no type', msg);
		return;
	}

	const type = applicationProperties?.type;

	if (type !== EventType.Create && type !== EventType.Update) {
		context.log.warn(`Ignoring invalid message, unsupported type '${type}'`, msg);
		return;
	}

	try {
		const res = await api.post(msg);

		const { id } = res;

		context.log.info(`Employee created: ${id}`);
	} catch (e) {
		if (e instanceof HTTPError) {
			context.log.error('Error creating employee', {
				message: e.message,
				body: e.response?.body
			});
		} else {
			context.log.error('Error creating employee', e);
		}
		throw e;
	}
}
