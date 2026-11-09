import { APPEAL_CASE_DECISION_OUTCOME } from '@planning-inspectorate/data-model';
import { APPEAL_TYPE } from '../constants/common.js';
import {
	appealCaseTypeToAppealTypeMapper,
	appealTypeToAppealCaseTypeMapper
} from './appeal-type-case.mapper.js';

const {
	ALLOWED,
	DISMISSED,
	INVALID,
	NOTICE_QUASHED,
	NOTICE_UPHELD,
	NOTICE_VARIED_AND_UPHELD,
	PLANNING_PERMISSION_GRANTED,
	QUASHED_ON_LEGAL_GROUNDS,
	SPLIT_DECISION
} = APPEAL_CASE_DECISION_OUTCOME;

export const DEFAULT_DECISION_OUTCOMES = Object.freeze([
	ALLOWED,
	DISMISSED,
	SPLIT_DECISION,
	INVALID
]);

/**
 * Mapping of appeal types to their relevant decision outcomes.
 * @type {Record<string, string[]>}
 */
export const APPEAL_TYPE_DECISION_OUTCOMES_MAP = Object.freeze({
	[APPEAL_TYPE.TREE_PRESERVATION_ORDER]: [ALLOWED, SPLIT_DECISION, DISMISSED],
	[APPEAL_TYPE.TREE_REPLACEMENT_NOTICE]: [ALLOWED, SPLIT_DECISION, DISMISSED],
	[APPEAL_TYPE.HIGH_HEDGES]: [ALLOWED, SPLIT_DECISION, DISMISSED],
	[APPEAL_TYPE.HEDGEROWS]: [ALLOWED, SPLIT_DECISION, DISMISSED],
	[APPEAL_TYPE.DISCONTINUANCE_NOTICE]: [INVALID, NOTICE_QUASHED, NOTICE_UPHELD],
	[APPEAL_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY]: [INVALID, ALLOWED, DISMISSED, SPLIT_DECISION],
	[APPEAL_TYPE.PLANNING_OBLIGATION]: [DISMISSED, ALLOWED, SPLIT_DECISION],
	[APPEAL_TYPE.ENVIRONMENTAL]: [DISMISSED, ALLOWED, SPLIT_DECISION],
	[APPEAL_TYPE.ENFORCEMENT_NOTICE]: [
		NOTICE_UPHELD,
		NOTICE_VARIED_AND_UPHELD,
		PLANNING_PERMISSION_GRANTED,
		QUASHED_ON_LEGAL_GROUNDS,
		SPLIT_DECISION,
		INVALID
	],
	[APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING]: [
		NOTICE_UPHELD,
		NOTICE_VARIED_AND_UPHELD,
		PLANNING_PERMISSION_GRANTED,
		QUASHED_ON_LEGAL_GROUNDS,
		SPLIT_DECISION,
		INVALID
	]
});

/**
 * Returns the relevant decision outcomes for a given appeal type.
 *
 * @param {string | null | undefined} appealType
 * @returns {string[]}
 */
export function getDecisionOutcomesForAppealType(appealType) {
	if (!appealType) {
		return [...DEFAULT_DECISION_OUTCOMES];
	}

	const trimmed = appealType.trim();

	if (APPEAL_TYPE_DECISION_OUTCOMES_MAP[trimmed]) {
		return [...APPEAL_TYPE_DECISION_OUTCOMES_MAP[trimmed]];
	}

	const fromCaseType = appealCaseTypeToAppealTypeMapper(trimmed.toUpperCase());
	if (fromCaseType) {
		const outcomes = APPEAL_TYPE_DECISION_OUTCOMES_MAP[fromCaseType];
		return outcomes ? [...outcomes] : [...DEFAULT_DECISION_OUTCOMES];
	}

	const caseType = appealTypeToAppealCaseTypeMapper(trimmed);
	if (caseType) {
		const mappedAppealType = appealCaseTypeToAppealTypeMapper(caseType);
		if (mappedAppealType && APPEAL_TYPE_DECISION_OUTCOMES_MAP[mappedAppealType]) {
			return [...APPEAL_TYPE_DECISION_OUTCOMES_MAP[mappedAppealType]];
		}
	}

	return [...DEFAULT_DECISION_OUTCOMES];
}
