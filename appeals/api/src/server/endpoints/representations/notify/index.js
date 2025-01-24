/*
This code maps representation types and statuses to 
a Notify email that is to be send when the status
is updated. The code in this file should rarely need
to be changed. 

To add a new Notify email head to ./type-map.js and
a tuple with the status, representation type and 
service function which sends the email there.

You shouldn't need to edit this unless there's
a bug in the switching or the conditions become
more complex.
*/

import { getNotifyService } from './get-service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('./services/index.js').ServiceArgs} ServiceArgs */

/**
 * @param {Request} request
 * @param {ServiceArgs} serviceArgs
 * @returns {Promise<void>}
 */
export const notifyOnStatusChange = (request, serviceArgs) => {
	const { status } = request.body;
	const { representationType: type, status: existingStatus } = serviceArgs.representation;
	if (!status || status === existingStatus) return Promise.resolve();
	const service = getNotifyService(status, type);
	if (!service) return Promise.resolve();
	return service(serviceArgs);
};
