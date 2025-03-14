import { postUpdateCompletedEvents } from './back-office-api-client.js';

/**
 *
 * @param {import('@azure/functions').Context} context
 */
export default async function (context) {
	context.log.info('Updating appeals with completed events');

	try {
		await postUpdateCompletedEvents();
	} catch (err) {
		context.log.info('Update failed');
		throw err;
	}

	context.log.info('Successfully updated appeals with completed events');
}
