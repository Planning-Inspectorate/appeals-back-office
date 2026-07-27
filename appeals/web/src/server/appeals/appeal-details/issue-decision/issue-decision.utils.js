import { isFeatureActive } from '#common/feature-flags.js';
import { isParentAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { getSavedBackUrl } from '#lib/middleware/save-back-url.js';
import { addBackLinkQueryToUrl, getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import {
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_INSPECTOR,
	DECISION_TYPE_LPA_COSTS
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_DECISION_OUTCOME } from '@planning-inspectorate/data-model';

/**
 * @typedef {import('@pins/express/types/express.js').Request & {specificDecisionType?: string}} Request
 * @typedef {import("express-session").Session & Partial<import("express-session").SessionData>} Session
 * @typedef {import('../appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('#appeals/personal-list/personal-list.mapper').PersonalListAppeal} PersonalListAppeal
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
	const { inspectorDecision, appellantCostsDecision, lpaCostsDecision, childDecisions } = session;

	const decisions = [
		{ ...inspectorDecision, decisionType: DECISION_TYPE_INSPECTOR },
		{ ...appellantCostsDecision, decisionType: DECISION_TYPE_APPELLANT_COSTS },
		{ ...lpaCostsDecision, decisionType: DECISION_TYPE_LPA_COSTS }
	].filter(
		(decision) =>
			decision.outcome === APPEAL_CASE_DECISION_OUTCOME.INVALID || decision?.files?.length
	);

	if (childDecisions?.decisions?.length) {
		decisions.push(
			// @ts-ignore
			...childDecisions.decisions.map((decision) => ({
				outcome: decision.outcome,
				appealId: decision.appealId.toString(),
				decisionType: DECISION_TYPE_INSPECTOR,
				files: inspectorDecision.files,
				invalidReason: inspectorDecision.invalidReason,
				isChildAppeal: true
			}))
		);
	}
	return decisions;
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
 * @param {WebAppeal | Partial<PersonalListAppeal & { appealTimetable: Record<string, string>; awaitingLinkedAppeal: boolean; costs?: *; costsDecision?: *}>} currentAppeal
 * @returns {{appellantHasAppliedForCosts: boolean, lpaHasAppliedForCosts: boolean, appellantDecisionHasAlreadyBeenIssued: boolean, lpaDecisionHasAlreadyBeenIssued: boolean}}
 */
export function buildIssueDecisionLogicData(currentAppeal) {
	const appellantApplicationDocumentsCount =
		currentAppeal.costs?.appellantApplicationFolder?.documents?.length || 0;
	const appellantWithdrawalDocumentsCount =
		currentAppeal.costs?.appellantWithdrawalFolder?.documents?.length || 0;
	const lpaApplicationDocumentsCount =
		currentAppeal.costs?.lpaApplicationFolder?.documents?.length || 0;
	const lpaWithdrawalDocumentsCount =
		currentAppeal.costs?.lpaWithdrawalFolder?.documents?.length || 0;
	const appellantDecisionLetterExists =
		!!currentAppeal.costs?.appellantDecisionFolder?.documents?.length;
	const lpaDecisionLetterExists = !!currentAppeal.costs?.lpaDecisionFolder?.documents?.length;
	return {
		appellantHasAppliedForCosts:
			appellantApplicationDocumentsCount > appellantWithdrawalDocumentsCount,
		lpaHasAppliedForCosts: lpaApplicationDocumentsCount > lpaWithdrawalDocumentsCount,
		appellantDecisionHasAlreadyBeenIssued: appellantDecisionLetterExists,
		lpaDecisionHasAlreadyBeenIssued: lpaDecisionLetterExists
	};
}

/**
 * @param {WebAppeal} currentAppeal
 * @param {string} childAppealId
 * @param {Request} request
 * @returns {string}
 */
export function issueDecisionBackUrl(currentAppeal, childAppealId, request) {
	const linkedAppealIndex =
		childAppealId &&
		currentAppeal.linkedAppeals.findIndex(
			// @ts-ignore
			(linkedAppeal) => linkedAppeal.appealId === Number(childAppealId)
		);

	// @ts-ignore
	if (isNaN(linkedAppealIndex)) {
		return getSavedBackUrl(request, 'issueDecision') || '';
	}

	if (linkedAppealIndex === 0) {
		// This will be the issue decision page for the linked lead appeal
		return `${baseUrl(currentAppeal)}/decision`;
	}

	// This will be the issue decision page for the previous linked child appeal
	return `${baseUrl(currentAppeal)}/${
		// @ts-ignore
		currentAppeal.linkedAppeals[linkedAppealIndex - 1].appealId
	}/decision`;
}

/**
 *
 * @param {Request} request
 */
export function decisionLetterUploadBackUrl(request) {
	const backUrl = getBackLinkUrlFromQuery(request);
	if (backUrl) {
		return backUrl;
	}

	const { currentAppeal, session } = request;

	return session.inspectorDecision?.outcome === APPEAL_CASE_DECISION_OUTCOME.INVALID &&
		isFeatureActive(FEATURE_FLAG_NAMES.INVALID_DECISION_LETTER)
		? `${baseUrl(currentAppeal)}/decision-letter`
		: isParentAppeal(currentAppeal)
			? `${baseUrl(currentAppeal)}/${
					currentAppeal.linkedAppeals[currentAppeal.linkedAppeals.length - 1].appealId
				}/decision`
			: `${baseUrl(currentAppeal)}/decision`;
}

/**
 *
 * @param {Request} request
 */
export function appellantCostsDecisionBackUrl(request) {
	const backUrl = getBackLinkUrlFromQuery(request);
	if (backUrl) {
		return backUrl;
	}

	const { currentAppeal, session } = request;

	return session.inspectorDecision?.files?.length
		? `${baseUrl(currentAppeal)}/decision-letter-upload`
		: session.inspectorDecision.outcome === APPEAL_CASE_DECISION_OUTCOME.INVALID &&
			  session.inspectorDecision?.invalidReason?.length &&
			  isFeatureActive(FEATURE_FLAG_NAMES.INVALID_DECISION_LETTER)
			? `${baseUrl(currentAppeal)}/invalid-reason`
			: decisionLetterUploadBackUrl(request);
}

/**
 *
 * @param {Request} request
 */
export function lpaCostsDecisionBackUrl(request) {
	const backUrl = getBackLinkUrlFromQuery(request);
	if (backUrl) {
		return backUrl;
	}

	const { currentAppeal, session } = request;
	const { appellantHasAppliedForCosts, appellantDecisionHasAlreadyBeenIssued } =
		buildIssueDecisionLogicData(currentAppeal);

	return session.issueDecision.appellantCostsDecision === 'false'
		? `${baseUrl(currentAppeal)}/appellant-costs-decision`
		: appellantHasAppliedForCosts && !appellantDecisionHasAlreadyBeenIssued
			? `${baseUrl(currentAppeal)}/appellant-costs-decision-letter-upload`
			: appellantCostsDecisionBackUrl(request);
}

/**
 *
 * @param {WebAppeal} currentAppeal
 * @param {Request} request
 * @param {string | undefined} specificDecisionType
 */
export function checkAndConfirmBackUrl(currentAppeal, request, specificDecisionType) {
	const backUrl = getBackLinkUrlFromQuery(request);
	if (backUrl) {
		return backUrl;
	}

	const baseRoute = baseUrl(currentAppeal);

	if (specificDecisionType) {
		return `${addBackLinkQueryToUrl(
			request,
			`${baseRoute}/issue-${specificDecisionType}-letter-upload`
		)}`;
	} else if (request.session.issueDecision.lpaCostsDecision === 'true') {
		return `${addBackLinkQueryToUrl(
			request,
			`${baseRoute}/issue-lpa-costs-decision-letter-upload`
		)}`;
	} else if (request.session.issueDecision.lpaCostsDecision === 'false') {
		return `${addBackLinkQueryToUrl(request, `${baseRoute}/lpa-costs-decision`)}`;
	} else {
		return appellantCostsDecisionBackUrl(request);
	}
}
