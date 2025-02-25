import { publishInvalidDecision } from './invalid-appeal-decision.service.js';
import { ERROR_INVALID_APPEAL_STATE } from '#endpoints/constants.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const postInvalidDecision = async (req, res) => {
	const { appeal } = req;
	const { invalidDecisionReason } = req.body;
	const notifyClient = req.notifyClient;

	if (appeal.appealStatus[0].status !== APPEAL_CASE_STATUS.ISSUE_DETERMINATION) {
		return res.status(400).send({ errors: { state: ERROR_INVALID_APPEAL_STATE } });
	}

	const decision = await publishInvalidDecision(
		appeal,
		invalidDecisionReason,
		req.get('azureAdUserId') || '',
		// @ts-ignore
		notifyClient
	);

	return res.status(201).send(decision);
};
