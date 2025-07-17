import { publishDecision } from './decision.service.js';
import {
	AUDIT_TRAIL_APPELLANT_COSTS_DECISION_ISSUED,
	AUDIT_TRAIL_LPA_COSTS_DECISION_ISSUED,
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_INSPECTOR,
	DECISION_TYPE_LPA_COSTS,
	ERROR_INVALID_APPEAL_STATE
} from '@pins/appeals/constants/support.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { isCurrentStatus } from '#utils/current-status.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {{decisionType: string, outcome: string, documentGuid: string, documentDate: Date}} Decision */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const postInspectorDecision = async (req, res) => {
	const { appeal } = req;
	const { decisions } = req.body;

	if (
		decisions.some(
			(/** @type {Decision} */ decision) => decision?.decisionType === DECISION_TYPE_INSPECTOR
		) &&
		!isCurrentStatus(req.appeal, APPEAL_CASE_STATUS.ISSUE_DETERMINATION)
	) {
		return res.status(400).send({ errors: { state: ERROR_INVALID_APPEAL_STATE } });
	}

	const notifyClient = req.notifyClient;
	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';

	const azureAdUserId = req.get('azureAdUserId') || '';

	const results = await Promise.all(
		decisions.map(
			/** @param {Decision} decision **/ async (decision) => {
				const { decisionType, documentDate, documentGuid, outcome } = decision;
				switch (decisionType) {
					case DECISION_TYPE_INSPECTOR: {
						return publishDecision(
							appeal,
							outcome,
							documentDate,
							documentGuid,
							notifyClient,
							siteAddress,
							azureAdUserId
						);
					}
					case DECISION_TYPE_APPELLANT_COSTS: {
						await createAuditTrail({
							appealId: appeal.id,
							azureAdUserId,
							details: AUDIT_TRAIL_APPELLANT_COSTS_DECISION_ISSUED
						});
						return null;
					}
					case DECISION_TYPE_LPA_COSTS: {
						await createAuditTrail({
							appealId: appeal.id,
							azureAdUserId,
							details: AUDIT_TRAIL_LPA_COSTS_DECISION_ISSUED
						});
						return null;
					}
				}
			}
		)
	);

	const decision = results.find((result) => result !== null) ?? null;

	return res.status(201).send(decision);
};
