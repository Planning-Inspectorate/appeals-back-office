import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_DECISION_OUTCOME } from '@planning-inspectorate/data-model';
import { toSentenceCase } from './string-case.js';

/**
 * @param {string | null | undefined} decisionType
 * @param {string | null | undefined} appealType
 * @returns {string}
 */
export function decisionOutcomeToDisplayText(decisionType, appealType) {
	if (!decisionType) {
		return '';
	}

	if (
		decisionType === APPEAL_CASE_DECISION_OUTCOME.PLANNING_PERMISSION_GRANTED &&
		appealType === APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
	) {
		return 'Listed building consent granted';
	}

	return toSentenceCase(decisionType);
}
