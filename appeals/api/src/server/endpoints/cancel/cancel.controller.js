import * as cancelAppealService from './cancel.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} request
 * @param {Response} response
 */
export const postCancelEnforcementNoticeWithdrawn = async (request, response) => {
	const { appeal, notifyClient } = request;
	const { dryRun } = request.query;
	const azureAdUserId = String(request.get('azureAdUserId'));

	const notifyPreviews = await cancelAppealService.enforcementNoticeWithdrawn(
		appeal,
		azureAdUserId,
		notifyClient,
		Boolean(dryRun)
	);

	if (dryRun) {
		return response.status(200).json(notifyPreviews);
	} else {
		return response.status(200).json(appeal);
	}
};
