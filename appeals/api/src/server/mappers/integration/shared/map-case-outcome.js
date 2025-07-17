import {
	CASE_OUTCOME_ALLOWED,
	CASE_OUTCOME_DISMISSED,
	CASE_OUTCOME_INVALID,
	CASE_OUTCOME_SPLIT_DECISION
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_DECISION_OUTCOME } from '@planning-inspectorate/data-model';

/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 * @param {MappingRequest} data
 * @returns {{ caseDecisionOutcome: string|null }}
 */
export const mapCaseOutcome = (data) => {
	const { appeal } = data;

	const outcome = appeal.inspectorDecision?.outcome || null;
	const mappedOutcome = {
		[CASE_OUTCOME_ALLOWED]: APPEAL_CASE_DECISION_OUTCOME.ALLOWED,
		[CASE_OUTCOME_INVALID]: APPEAL_CASE_DECISION_OUTCOME.INVALID,
		[CASE_OUTCOME_DISMISSED]: APPEAL_CASE_DECISION_OUTCOME.DISMISSED,
		[CASE_OUTCOME_SPLIT_DECISION]: APPEAL_CASE_DECISION_OUTCOME.SPLIT_DECISION,
		[APPEAL_CASE_DECISION_OUTCOME.SPLIT_DECISION]: APPEAL_CASE_DECISION_OUTCOME.SPLIT_DECISION
	};
	const broadcastedOutcome = outcome === null ? null : mappedOutcome[outcome];

	return {
		caseDecisionOutcome: broadcastedOutcome
	};
};
