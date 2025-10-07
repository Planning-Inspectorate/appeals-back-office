import { EventType } from '@pins/event-client';
import { HTTPError } from 'got';
import api from './back-office-api-client.js';

/**
 *
 * @type {import('@azure/functions').ServiceBusTopicHandler}
 */
export default async function (msg, context) {
	context.info('LPA questionnaire import command');

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

	if (type !== EventType.Create && type !== EventType.Update) {
		context.warn(`Ignoring invalid message, unsupported type '${type}'`);
		return {};
	}

	try {
		const res = await api.post(msg);

		const { reference: caseReference } = res;

		context.info(`LPA questionnaire created for appeal: ${caseReference}`);
	} catch (e) {
		if (e instanceof HTTPError) {
			context.error('Error creating LPA questionnaire', {
				message: e.message,
				body: e.response?.body
			});
		} else {
			context.error('Error creating LPA questionnaire', e);
		}
		throw e;
	}

	return {};
}
