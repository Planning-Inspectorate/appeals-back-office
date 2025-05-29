import {
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_INSPECTOR,
	DECISION_TYPE_LPA_COSTS
} from '@pins/appeals/constants/support.js';

/**
 * @typedef {import('@pins/express/types/express.js').Request & {specificDecisionType?: string}} Request
 * @typedef {import("express-session").Session & Partial<import("express-session").SessionData>} Session
 */

/**
 *
 * @param {import('../appeal-details.types.js').WebAppeal} currentAppeal
 * @returns {string}
 */
export function baseUrl(currentAppeal) {
	return `/appeals-service/appeal-details/${currentAppeal.appealId}/issue-decision`;
}

/**
 * @param {Request} request
 * @returns {string}
 */
export function checkDecisionUrl(request) {
	const { currentAppeal, specificDecisionType } = request;
	switch (specificDecisionType) {
		case DECISION_TYPE_APPELLANT_COSTS:
			return `${baseUrl(currentAppeal)}/check-your-appellant-costs-decision`;
		case DECISION_TYPE_LPA_COSTS:
			return `${baseUrl(currentAppeal)}/check-your-lpa-costs-decision`;
		default:
			return `${baseUrl(currentAppeal)}/check-your-decision`;
	}
}

/**
 * @param {Session} session
 * @returns {any[]}
 */
export function getDecisions(session) {
	const { inspectorDecision, appellantCostsDecision, lpaCostsDecision } = session;

	return [
		{ ...inspectorDecision, decisionType: DECISION_TYPE_INSPECTOR },
		{ ...appellantCostsDecision, decisionType: DECISION_TYPE_APPELLANT_COSTS },
		{ ...lpaCostsDecision, decisionType: DECISION_TYPE_LPA_COSTS }
	].filter((decision) => decision?.files?.length);
}
