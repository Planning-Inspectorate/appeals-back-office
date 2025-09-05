import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { isCurrentStatus } from '#utils/current-status.js';
import {
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_INSPECTOR,
	DECISION_TYPE_LPA_COSTS,
	ERROR_INVALID_APPEAL_STATE
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { publishChildDecision, publishCostsDecision, publishDecision } from './decision.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {{decisionType: string, outcome: string, documentGuid: string, documentDate: Date, appealId: number, isChildAppeal: boolean}} Decision */

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
				const {
					decisionType,
					documentDate,
					documentGuid,
					outcome,
					appealId: decisionAppealId,
					isChildAppeal
				} = decision;
				switch (decisionType) {
					case DECISION_TYPE_INSPECTOR: {
						if (isChildAppeal) {
							return publishChildDecision(
								Number(decisionAppealId),
								outcome,
								documentDate,
								azureAdUserId
							);
						}
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
					case DECISION_TYPE_APPELLANT_COSTS:
					case DECISION_TYPE_LPA_COSTS: {
						// If the decisions are part of the full issue decision flow (including the inspector decision), we don't want to send the costs decision notifies.
						const skipNotifies = decisions.some(
							/** @param {Decision} decision **/
							(decision) => decision.decisionType === DECISION_TYPE_INSPECTOR
						);
						return publishCostsDecision(
							appeal,
							notifyClient,
							siteAddress,
							azureAdUserId,
							decisionType,
							skipNotifies
						);
					}
				}
			}
		)
	);

	const decision = results.find((result) => result !== null) ?? null;

	return res.status(201).send(decision);
};
