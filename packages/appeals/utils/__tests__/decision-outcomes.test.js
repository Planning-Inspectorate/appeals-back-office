import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_DECISION_OUTCOME, APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import { decisionOutcomeToDisplayText } from '../decision-outcome-display-text.js';
import {
	DEFAULT_DECISION_OUTCOMES,
	getDecisionOutcomesForAppealType
} from '../decision-outcomes.js';

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

describe('decisionOutcomeToDisplayText', () => {
	it('should return empty string if decisionType is falsy', () => {
		expect(decisionOutcomeToDisplayText(null, APPEAL_TYPE.S78)).toBe('');
		expect(decisionOutcomeToDisplayText(undefined, APPEAL_TYPE.S78)).toBe('');
		expect(decisionOutcomeToDisplayText('', APPEAL_TYPE.S78)).toBe('');
	});

	it('should return "Listed building consent granted" for planning_permission_granted on enforcement listed building appeal', () => {
		expect(
			decisionOutcomeToDisplayText(
				APPEAL_CASE_DECISION_OUTCOME.PLANNING_PERMISSION_GRANTED,
				APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
			)
		).toBe('Listed building consent granted');
	});

	it('should return "Planning permission granted" for planning_permission_granted on other appeal types', () => {
		expect(
			decisionOutcomeToDisplayText(
				APPEAL_CASE_DECISION_OUTCOME.PLANNING_PERMISSION_GRANTED,
				APPEAL_TYPE.ENFORCEMENT_NOTICE
			)
		).toBe('Planning permission granted');
		expect(
			decisionOutcomeToDisplayText(
				APPEAL_CASE_DECISION_OUTCOME.PLANNING_PERMISSION_GRANTED,
				APPEAL_TYPE.S78
			)
		).toBe('Planning permission granted');
	});

	it('should format standard decision outcomes to sentence case', () => {
		expect(
			decisionOutcomeToDisplayText(APPEAL_CASE_DECISION_OUTCOME.ALLOWED, APPEAL_TYPE.S78)
		).toBe('Allowed');
		expect(
			decisionOutcomeToDisplayText(APPEAL_CASE_DECISION_OUTCOME.DISMISSED, APPEAL_TYPE.S78)
		).toBe('Dismissed');
		expect(
			decisionOutcomeToDisplayText(APPEAL_CASE_DECISION_OUTCOME.SPLIT_DECISION, APPEAL_TYPE.S78)
		).toBe('Split decision');
		expect(
			decisionOutcomeToDisplayText(APPEAL_CASE_DECISION_OUTCOME.INVALID, APPEAL_TYPE.S78)
		).toBe('Invalid');
	});

	it('should format enforcement decision outcomes to sentence case including notice_quashed', () => {
		expect(
			decisionOutcomeToDisplayText(
				APPEAL_CASE_DECISION_OUTCOME.NOTICE_UPHELD,
				APPEAL_TYPE.ENFORCEMENT_NOTICE
			)
		).toBe('Notice upheld');
		expect(
			decisionOutcomeToDisplayText(
				APPEAL_CASE_DECISION_OUTCOME.NOTICE_VARIED_AND_UPHELD,
				APPEAL_TYPE.ENFORCEMENT_NOTICE
			)
		).toBe('Notice varied and upheld');
		expect(
			decisionOutcomeToDisplayText(
				APPEAL_CASE_DECISION_OUTCOME.NOTICE_QUASHED,
				APPEAL_TYPE.ENFORCEMENT_NOTICE
			)
		).toBe('Notice quashed');
		expect(
			decisionOutcomeToDisplayText(
				APPEAL_CASE_DECISION_OUTCOME.QUASHED_ON_LEGAL_GROUNDS,
				APPEAL_TYPE.ENFORCEMENT_NOTICE
			)
		).toBe('Quashed on legal grounds');
	});
});

describe('getDecisionOutcomesForAppealType', () => {
	it('should return DEFAULT_DECISION_OUTCOMES when appealType is falsy', () => {
		expect(getDecisionOutcomesForAppealType(null)).toEqual(DEFAULT_DECISION_OUTCOMES);
		expect(getDecisionOutcomesForAppealType(undefined)).toEqual(DEFAULT_DECISION_OUTCOMES);
		expect(getDecisionOutcomesForAppealType('')).toEqual(DEFAULT_DECISION_OUTCOMES);
	});

	it('should return DEFAULT_DECISION_OUTCOMES for unrecognized appeal types', () => {
		expect(getDecisionOutcomesForAppealType('UNKNOWN')).toEqual(DEFAULT_DECISION_OUTCOMES);
		expect(getDecisionOutcomesForAppealType(APPEAL_CASE_TYPE.D)).toEqual(DEFAULT_DECISION_OUTCOMES);
		expect(getDecisionOutcomesForAppealType(APPEAL_TYPE.HOUSEHOLDER)).toEqual(
			DEFAULT_DECISION_OUTCOMES
		);
	});

	it('should return correct outcomes for case type letter codes', () => {
		expect(getDecisionOutcomesForAppealType(APPEAL_CASE_TYPE.TPO)).toEqual([
			ALLOWED,
			SPLIT_DECISION,
			DISMISSED
		]);
		expect(getDecisionOutcomesForAppealType(APPEAL_CASE_TYPE.TRN)).toEqual([
			ALLOWED,
			SPLIT_DECISION,
			DISMISSED
		]);
		expect(getDecisionOutcomesForAppealType(APPEAL_CASE_TYPE.HH)).toEqual([
			ALLOWED,
			SPLIT_DECISION,
			DISMISSED
		]);
		expect(getDecisionOutcomesForAppealType(APPEAL_CASE_TYPE.HR)).toEqual([
			ALLOWED,
			SPLIT_DECISION,
			DISMISSED
		]);
		expect(getDecisionOutcomesForAppealType(APPEAL_CASE_TYPE.G)).toEqual([
			INVALID,
			NOTICE_QUASHED,
			NOTICE_UPHELD
		]);
		expect(getDecisionOutcomesForAppealType(APPEAL_CASE_TYPE.L)).toEqual([
			INVALID,
			ALLOWED,
			DISMISSED,
			SPLIT_DECISION
		]);
		expect(getDecisionOutcomesForAppealType(APPEAL_CASE_TYPE.Q)).toEqual([
			DISMISSED,
			ALLOWED,
			SPLIT_DECISION
		]);
		expect(getDecisionOutcomesForAppealType(APPEAL_CASE_TYPE.ENV)).toEqual([
			DISMISSED,
			ALLOWED,
			SPLIT_DECISION
		]);
		expect(getDecisionOutcomesForAppealType(APPEAL_CASE_TYPE.C)).toEqual([
			NOTICE_UPHELD,
			NOTICE_VARIED_AND_UPHELD,
			PLANNING_PERMISSION_GRANTED,
			QUASHED_ON_LEGAL_GROUNDS,
			SPLIT_DECISION,
			INVALID
		]);
		expect(getDecisionOutcomesForAppealType(APPEAL_CASE_TYPE.F)).toEqual([
			NOTICE_UPHELD,
			NOTICE_VARIED_AND_UPHELD,
			PLANNING_PERMISSION_GRANTED,
			QUASHED_ON_LEGAL_GROUNDS,
			SPLIT_DECISION,
			INVALID
		]);
	});

	it('should handle lowercase letter codes', () => {
		expect(getDecisionOutcomesForAppealType('tpo')).toEqual([ALLOWED, SPLIT_DECISION, DISMISSED]);
		expect(getDecisionOutcomesForAppealType('c')).toEqual([
			NOTICE_UPHELD,
			NOTICE_VARIED_AND_UPHELD,
			PLANNING_PERMISSION_GRANTED,
			QUASHED_ON_LEGAL_GROUNDS,
			SPLIT_DECISION,
			INVALID
		]);
	});

	it('should resolve outcomes for full and short display names', () => {
		expect(getDecisionOutcomesForAppealType(APPEAL_TYPE.TREE_PRESERVATION_ORDER)).toEqual([
			ALLOWED,
			SPLIT_DECISION,
			DISMISSED
		]);
		expect(getDecisionOutcomesForAppealType(APPEAL_TYPE.HIGH_HEDGES)).toEqual([
			ALLOWED,
			SPLIT_DECISION,
			DISMISSED
		]);
		expect(getDecisionOutcomesForAppealType('High hedges')).toEqual([
			ALLOWED,
			SPLIT_DECISION,
			DISMISSED
		]);
		expect(getDecisionOutcomesForAppealType('Section 106 agreement')).toEqual([
			DISMISSED,
			ALLOWED,
			SPLIT_DECISION
		]);
		expect(getDecisionOutcomesForAppealType(APPEAL_TYPE.ENFORCEMENT_NOTICE)).toEqual([
			NOTICE_UPHELD,
			NOTICE_VARIED_AND_UPHELD,
			PLANNING_PERMISSION_GRANTED,
			QUASHED_ON_LEGAL_GROUNDS,
			SPLIT_DECISION,
			INVALID
		]);
		expect(getDecisionOutcomesForAppealType('Enforcement notice')).toEqual([
			NOTICE_UPHELD,
			NOTICE_VARIED_AND_UPHELD,
			PLANNING_PERMISSION_GRANTED,
			QUASHED_ON_LEGAL_GROUNDS,
			SPLIT_DECISION,
			INVALID
		]);
	});
});
