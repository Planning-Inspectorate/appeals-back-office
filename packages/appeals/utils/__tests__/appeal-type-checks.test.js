import {
	APPEAL_APPLICATION_DECISION,
	APPEAL_CASE_TYPE,
	APPEAL_TYPE_OF_PLANNING_APPLICATION
} from '@planning-inspectorate/data-model';
import { APPEAL_TYPE } from '../../constants/common';
import {
	isAnyEnforcementAppealType,
	isLdcOrDiscontinuanceOrEnforcementAppealType,
	isLdcOrEnforcementCaseType,
	isS78ExpeditedAppealType
} from '../appeal-type-checks';

describe('isAnyEnforcementAppealType', () => {
	it.each([APPEAL_TYPE.ENFORCEMENT_NOTICE, APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING])(
		'returns true for %s',
		(appealType) => {
			expect(isAnyEnforcementAppealType(appealType)).toBe(true);
		}
	);

	it.each([
		APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
		APPEAL_TYPE.DISCONTINUANCE_NOTICE,
		APPEAL_TYPE.HOUSEHOLDER,
		APPEAL_TYPE.S78,
		APPEAL_TYPE.ADVERTISEMENT,
		APPEAL_TYPE.PLANNED_LISTED_BUILDING,
		APPEAL_TYPE.CAS_PLANNING,
		APPEAL_TYPE.CAS_ADVERTISEMENT
	])('returns false for %s', (appealType) => {
		expect(isAnyEnforcementAppealType(appealType)).toBe(false);
	});
});

describe('isLdcOrDiscontinuanceOrEnforcementAppealType', () => {
	it.each([
		APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
		APPEAL_TYPE.DISCONTINUANCE_NOTICE,
		APPEAL_TYPE.ENFORCEMENT_NOTICE,
		APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
	])('returns true for %s', (appealType) => {
		expect(isLdcOrDiscontinuanceOrEnforcementAppealType(appealType)).toBe(true);
	});

	it.each([
		APPEAL_TYPE.HOUSEHOLDER,
		APPEAL_TYPE.S78,
		APPEAL_TYPE.ADVERTISEMENT,
		APPEAL_TYPE.PLANNED_LISTED_BUILDING,
		APPEAL_TYPE.CAS_PLANNING,
		APPEAL_TYPE.CAS_ADVERTISEMENT
	])('returns false for %s', (appealType) => {
		expect(isLdcOrDiscontinuanceOrEnforcementAppealType(appealType)).toBe(false);
	});
});

describe('isLdcOrEnforcementAppealType', () => {
	it.each([APPEAL_CASE_TYPE.X, APPEAL_CASE_TYPE.C, APPEAL_CASE_TYPE.F])(
		'returns true for %s',
		(appealType) => {
			expect(isLdcOrEnforcementCaseType(appealType)).toBe(true);
		}
	);
	it.each([
		APPEAL_CASE_TYPE.D,
		APPEAL_CASE_TYPE.G,
		APPEAL_CASE_TYPE.H,
		APPEAL_CASE_TYPE.L,
		APPEAL_CASE_TYPE.Q,
		APPEAL_CASE_TYPE.S,
		APPEAL_CASE_TYPE.V,
		APPEAL_CASE_TYPE.W,
		APPEAL_CASE_TYPE.Y,
		APPEAL_CASE_TYPE.Z,
		APPEAL_CASE_TYPE.ZA,
		APPEAL_CASE_TYPE.ZP
	])('returns false for %s', (appealType) => {
		expect(isLdcOrEnforcementCaseType(appealType)).toBe(false);
	});
});
describe('isS78ExpeditedAppealType', () => {
	const S78 = APPEAL_CASE_TYPE.W;
	const afterCutoff = '2026-04-01T00:00:00.000Z';
	const beforeCutoff = '2026-03-31T00:00:00.000Z';

	it.each([
		APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.OUTLINE_PLANNING,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.RESERVED_MATTERS,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.PRIOR_APPROVAL,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.REMOVAL_OR_VARIATION_OF_CONDITIONS
	])('returns true for S78 + %s + refused + date on/after cutoff', (typeOfPlanningApplication) => {
		expect(
			isS78ExpeditedAppealType(
				S78,
				afterCutoff,
				APPEAL_APPLICATION_DECISION.REFUSED,
				typeOfPlanningApplication
			)
		).toBe(true);
	});

	it.each([
		APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.OUTLINE_PLANNING,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.RESERVED_MATTERS,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.PRIOR_APPROVAL,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.REMOVAL_OR_VARIATION_OF_CONDITIONS
	])('returns true for S78 + %s + granted + date on/after cutoff', (typeOfPlanningApplication) => {
		expect(
			isS78ExpeditedAppealType(
				S78,
				afterCutoff,
				APPEAL_APPLICATION_DECISION.GRANTED,
				typeOfPlanningApplication
			)
		).toBe(true);
	});
	it.each([
		APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.OUTLINE_PLANNING,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.RESERVED_MATTERS,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.PRIOR_APPROVAL,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.REMOVAL_OR_VARIATION_OF_CONDITIONS
	])('returns false for S78 + %s + granted + date before cutoff', (typeOfPlanningApplication) => {
		expect(
			isS78ExpeditedAppealType(
				S78,
				beforeCutoff,
				APPEAL_APPLICATION_DECISION.GRANTED,
				typeOfPlanningApplication
			)
		).toBe(false);
	});

	it('returns true for HOUSEHOLDER_PLANNING + granted', () => {
		expect(
			isS78ExpeditedAppealType(
				S78,
				afterCutoff,
				APPEAL_APPLICATION_DECISION.GRANTED,
				APPEAL_TYPE_OF_PLANNING_APPLICATION.HOUSEHOLDER_PLANNING
			)
		).toBe(true);
	});

	it('returns false for HOUSEHOLDER_PLANNING + refused', () => {
		expect(
			isS78ExpeditedAppealType(
				S78,
				afterCutoff,
				APPEAL_APPLICATION_DECISION.REFUSED,
				APPEAL_TYPE_OF_PLANNING_APPLICATION.HOUSEHOLDER_PLANNING
			)
		).toBe(false);
	});
});
