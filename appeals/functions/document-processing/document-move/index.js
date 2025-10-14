import { copyBlob } from './blob.js';

/**
 * @type {import('@azure/functions').ServiceBusTopicHandler}
 */
export default async function (msg, context) {
	context.info('Document move', msg);
	try {
		// @ts-ignore
		const { originalURI, importedURI } = msg;
		await copyBlob(originalURI, importedURI);
	} catch (e) {
		context.error('Not enough information to process this request', e);
		throw e;
	}

	return {};
}
