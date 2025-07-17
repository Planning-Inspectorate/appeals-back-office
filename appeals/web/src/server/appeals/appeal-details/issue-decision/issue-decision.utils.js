import {
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_INSPECTOR,
	DECISION_TYPE_LPA_COSTS
} from '@pins/appeals/constants/support.js';

/**
 * @typedef {import('@pins/express/types/express.js').Request & {specificDecisionType?: string}} Request
 * @typedef {import("express-session").Session & Partial<import("express-session").SessionData>} Session
 * @typedef {import('../appeal-details.types.js').WebAppeal} WebAppeal
 */

/**
 *
 * @param {WebAppeal|{appealId:string}} currentAppeal
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

/**
 * Checks if the given outcome is a valid InspectorDecisionRequest and returns the corresponding mapped value.
 * @param {string | undefined | null} outcome The outcome to check.
 * @returns {string} The mapped decision string, or a default value if the outcome is invalid or undefined.
 */
export function mapDecisionOutcome(outcome) {
	switch (outcome?.toLowerCase()) {
		case 'allowed':
			return 'Allowed';
		case 'dismissed':
			return 'Dismissed';
		case 'split':
		case 'split_decision':
			return 'Split decision';
		case 'invalid':
			return 'Invalid';
		default:
			return '';
	}
}

/**
 * @param {string|number} appealId
 * @returns {string}
 */
export function generateIssueDecisionUrl(appealId) {
	return `/appeals-service/appeal-details/${appealId}/issue-decision/decision`;
}

/**
 *
 * @param {WebAppeal} currentAppeal
 * @returns {{appellantHasAppliedForCosts: boolean, lpaHasAppliedForCosts: boolean, appellantDecisionHasAlreadyBeenIssued: boolean, lpaDecisionHasAlreadyBeenIssued: boolean}}
 */
export function buildLogicData(currentAppeal) {
	const appellantApplicationDocumentsExists =
		!!currentAppeal.costs?.appellantApplicationFolder?.documents?.length;
	const appellantWithdrawalDocumentsExists =
		!!currentAppeal.costs?.appellantWithdrawalFolder?.documents?.length;
	const lpaApplicationDocumentsExists =
		!!currentAppeal.costs?.lpaApplicationFolder?.documents?.length;
	const lpaWithdrawalDocumentsExists =
		!!currentAppeal.costs?.lpaWithdrawalFolder?.documents?.length;
	const appellantDecisionLetterExists =
		!!currentAppeal.costs?.appellantDecisionFolder?.documents?.length;
	const lpaDecisionLetterExists = !!currentAppeal.costs?.lpaDecisionFolder?.documents?.length;
	return {
		appellantHasAppliedForCosts:
			appellantApplicationDocumentsExists && !appellantWithdrawalDocumentsExists,
		lpaHasAppliedForCosts: lpaApplicationDocumentsExists && !lpaWithdrawalDocumentsExists,
		appellantDecisionHasAlreadyBeenIssued: appellantDecisionLetterExists,
		lpaDecisionHasAlreadyBeenIssued: lpaDecisionLetterExists
	};
}
