import { publishDecision } from './appeal-decision.service.js';
import { ERROR_INVALID_APPEAL_STATE } from '@pins/appeals/constants/support.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import {
	APPEAL_CASE_DECISION_OUTCOME,
	APPEAL_CASE_STATUS
} from '@planning-inspectorate/data-model';
import { isCurrentStatus } from '#utils/current-status.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const postInspectorDecision = async (req, res) => {
	const { appeal, document } = req;
	const { documentDate, outcome } = req.body;

	let expectedOutcome = outcome;
	if (outcome === 'split decision') {
		expectedOutcome = APPEAL_CASE_DECISION_OUTCOME.SPLIT_DECISION;
	}

	if (!isCurrentStatus(appeal, APPEAL_CASE_STATUS.ISSUE_DETERMINATION)) {
		return res.status(400).send({ errors: { state: ERROR_INVALID_APPEAL_STATE } });
	}

	const notifyClient = req.notifyClient;
	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';

	const decision = await publishDecision(
		appeal,
		expectedOutcome,
		documentDate,
		document,
		notifyClient,
		siteAddress,
		req.get('azureAdUserId') || ''
	);

	return res.status(201).send(decision);
};
