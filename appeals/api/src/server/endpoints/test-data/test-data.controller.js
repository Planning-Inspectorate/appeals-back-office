import { testDataService } from './test-data.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const generateTestAppeals = async (request, response) => {
	const typeParam = Array.isArray(request.query.type) ? request.query.type[0] : request.query.type;
	const appealType = typeParam === 's78' ? 's78' : 'has';
	const count = typeof request.query.count === 'string' ? parseInt(request.query.count, 10) : 1;
	const userEmails = ['load-test@example.com', 'load-test2@example.com'];

	try {
		const appeals = await testDataService.generateAppeals(appealType, count, userEmails);
		return response.status(200).json({
			message: `Created ${count} ${appealType.toUpperCase()} appeal(s).`,
			count,
			sample: appeals.slice(0, 3)
		});
	} catch (/** @type {any} */ err) {
		console.error('Error creating test appeals:', err);
		return response.status(500).end();
	}
};
