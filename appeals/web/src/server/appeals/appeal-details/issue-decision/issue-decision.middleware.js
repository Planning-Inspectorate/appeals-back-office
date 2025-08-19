import { DECISION_TYPE_APPELLANT_COSTS } from '@pins/appeals/constants/support.js';

/** @typedef {import('@pins/express/types/express.js').Request & {specificDecisionType?: string}} Request */

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<void>}
 */
export const clearIssueDecisionCache = async (request, response, next) => {
	const appealId = request.params.appealId;
	const { inspectorDecision, appellantCostsDecision, lpaCostsDecision, childDecisions } =
		request.session;

	// If the appealId in the session doesn't match the appealId in the request, clear the session data.
	if (inspectorDecision?.appealId?.toString() !== appealId) request.session.inspectorDecision = {};
	if (appellantCostsDecision?.appealId?.toString() !== appealId)
		request.session.appellantCostsDecision = {};
	if (lpaCostsDecision?.appealId?.toString() !== appealId) request.session.lpaCostsDecision = {};
	if (childDecisions?.appealId?.toString() !== appealId) request.session.childDecisions = {};

	next();
};

/**
 *
 * @param {string} specificDecisionType
 * @returns {import("express").RequestHandler}
 */
export const setSpecificDecisionType = (specificDecisionType) => (request, response, next) => {
	// Clear the session data for the decision types that are not the one being set.
	request.session.inspectorDecision = {};
	if (specificDecisionType === DECISION_TYPE_APPELLANT_COSTS) {
		request.session.lpaCostsDecision = {};
	} else {
		request.session.appellantCostsDecision = {};
	}
	// Now set the specific decision type in the request.
	/* @ts-ignore */
	request.specificDecisionType = specificDecisionType;

	next();
};
