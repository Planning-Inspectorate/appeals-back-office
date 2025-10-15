import { postUpdateCompletedEvents } from './back-office-api-client.js';

/**
 *
 * @type {import('@azure/functions').TimerHandler}
 */
export default async function (_, context) {
	context.info('Updating appeals with completed events');

	try {
		await postUpdateCompletedEvents();
	} catch (err) {
		context.info('Update failed');
		throw err;
	}

	context.info('Successfully updated appeals with completed events');
	return {};
}
