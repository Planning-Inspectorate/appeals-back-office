import { publishInvalidDecision } from './invalid-appeal-decision.service.js';
import { ERROR_INVALID_APPEAL_STATE } from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { isCurrentStatus } from '#utils/current-status.js';

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

	if (!isCurrentStatus(appeal, APPEAL_CASE_STATUS.ISSUE_DETERMINATION)) {
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
