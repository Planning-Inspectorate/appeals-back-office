import { APPEAL_CASE_DECISION_OUTCOME } from '@planning-inspectorate/data-model';

/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 * @param {MappingRequest} data
 * @returns {{ caseDecisionOutcome: string|null }}
 */
export const mapCaseOutcome = (data) => {
	const { appeal } = data;

	const outcome = appeal.inspectorDecision?.outcome?.replace(/ /g, '_').toUpperCase() ?? '';

	// @ts-ignore
	const caseDecisionOutcome = APPEAL_CASE_DECISION_OUTCOME[outcome] ?? null;

	return {
		caseDecisionOutcome
	};
};
