/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<void>}
 */
export const clearIssueDecisionCache = async (request, response, next) => {
	const appealId = request.params.appealId;
	const { inspectorDecision, appellantCostsDecision, lpaCostsDecision } = request.session;

	// If the appealId in the session doesn't match the appealId in the request, clear the session data.
	if (inspectorDecision?.appealId !== appealId) request.session.inspectorDecision = {};
	if (appellantCostsDecision?.appealId !== appealId) request.session.appellantCostsDecision = {};
	if (lpaCostsDecision?.appealId !== appealId) request.session.lpaCostsDecision = {};

	next();
};
