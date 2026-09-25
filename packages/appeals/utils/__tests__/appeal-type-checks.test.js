import {
	APPEAL_APPLICATION_DECISION,
	APPEAL_CASE_TYPE,
	APPEAL_TYPE_OF_PLANNING_APPLICATION
} from '@planning-inspectorate/data-model';
import apiConfig from '../../../../appeals/api/src/server/config/config.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '../../constants/common';
import {
	beforeExpeditedOriginalApplicationCutOff,
	isAnyEnforcementAppealType,
	isEnforcementCaseType,
	isExpeditedAppealType,
	isLdcCaseType,
	isLdcOrDiscontinuanceOrEnforcementAppealType,
	isLdcOrDiscontinuanceOrEnforcementCaseType,
	isLdcOrEnforcementAppealType,
	isLdcOrEnforcementCaseType,
	isLinkedAppealsActiveForAppealOrCaseType,
	isNetResidencesAppealType,
	isS78ExpeditedAppealType
} from '../appeal-type-checks';

describe('beforeExpeditedOriginalApplicationCutOff', () => {
	it.each([undefined, null, ''])('returns true when application date is %p', (applicationDate) => {
		expect(beforeExpeditedOriginalApplicationCutOff(applicationDate)).toBe(true);
	});

	it('returns true when application date is before the cutoff', () => {
		expect(beforeExpeditedOriginalApplicationCutOff('2026-03-31T00:00:00.000Z')).toBe(true);
	});

	it('returns false when application date is on the cutoff', () => {
		expect(beforeExpeditedOriginalApplicationCutOff('2026-04-01T00:00:00.000Z')).toBe(false);
	});

	it('returns false when application date is after the cutoff', () => {
		expect(beforeExpeditedOriginalApplicationCutOff('2026-04-02T00:00:00.000Z')).toBe(false);
	});
});

describe('isExpeditedAppealType', () => {
	it.each([APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.ZA, APPEAL_CASE_TYPE.ZP])(
		'returns true for expedited appeal type %s',
		(appealType) => {
			expect(isExpeditedAppealType(appealType)).toBe(true);
		}
	);

	it.each([
		APPEAL_CASE_TYPE.H,
		APPEAL_CASE_TYPE.W,
		APPEAL_CASE_TYPE.Y,
		APPEAL_CASE_TYPE.C,
		APPEAL_CASE_TYPE.X,
		APPEAL_CASE_TYPE.F,
		''
	])('returns false for non-expedited appeal type %s', (appealType) => {
		expect(isExpeditedAppealType(appealType)).toBe(false);
	});

	it.each([undefined, null, 'unknown'])('throws when appeal type is %p', (appealType) => {
		expect(() => isExpeditedAppealType(appealType)).toThrow(
			`Appeal type - ${appealType} not defined in isExpeditedAppealType baseCaseType`
		);
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
		APPEAL_TYPE_OF_PLANNING_APPLICATION.REMOVAL_OR_VARIATION_OF_CONDITIONS,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.PERMISSION_IN_PRINCIPLE
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
		APPEAL_TYPE_OF_PLANNING_APPLICATION.REMOVAL_OR_VARIATION_OF_CONDITIONS,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.PERMISSION_IN_PRINCIPLE
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
		APPEAL_TYPE_OF_PLANNING_APPLICATION.REMOVAL_OR_VARIATION_OF_CONDITIONS,
		APPEAL_TYPE_OF_PLANNING_APPLICATION.PERMISSION_IN_PRINCIPLE
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

	it('returns true for appeal type mapping when appeal type is Planning appeal', () => {
		expect(
			isS78ExpeditedAppealType(
				APPEAL_TYPE.S78,
				afterCutoff,
				APPEAL_APPLICATION_DECISION.GRANTED,
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(true);
	});

	it('returns true for MINOR_COMMERCIAL_DEVELOPMENT + granted', () => {
		expect(
			isS78ExpeditedAppealType(
				S78,
				afterCutoff,
				APPEAL_APPLICATION_DECISION.GRANTED,
				APPEAL_TYPE_OF_PLANNING_APPLICATION.MINOR_COMMERCIAL_DEVELOPMENT
			)
		).toBe(true);
	});

	it('returns false for MINOR_COMMERCIAL_DEVELOPMENT + refused', () => {
		expect(
			isS78ExpeditedAppealType(
				S78,
				afterCutoff,
				APPEAL_APPLICATION_DECISION.REFUSED,
				APPEAL_TYPE_OF_PLANNING_APPLICATION.MINOR_COMMERCIAL_DEVELOPMENT
			)
		).toBe(false);
	});

	it.each([
		[undefined, afterCutoff],
		[null, afterCutoff],
		[S78, '']
	])(
		'returns false when appeal type or case submission date is missing: %p',
		(appealType, date) => {
			expect(
				isS78ExpeditedAppealType(
					appealType,
					date,
					APPEAL_APPLICATION_DECISION.GRANTED,
					APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
				)
			).toBe(false);
		}
	);

	it('returns false when appeal type is not S78', () => {
		expect(
			isS78ExpeditedAppealType(
				APPEAL_CASE_TYPE.D,
				afterCutoff,
				APPEAL_APPLICATION_DECISION.GRANTED,
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(false);
	});

	it('returns false when decision is not eligible', () => {
		expect(
			isS78ExpeditedAppealType(
				S78,
				afterCutoff,
				'Unknown decision',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(false);
	});

	it('returns false when planning application type is not eligible', () => {
		expect(
			isS78ExpeditedAppealType(
				S78,
				afterCutoff,
				APPEAL_APPLICATION_DECISION.GRANTED,
				'Not an eligible planning application'
			)
		).toBe(false);
	});
});

describe('isEnforcementCaseType', () => {
	it.each([APPEAL_CASE_TYPE.C, APPEAL_CASE_TYPE.F])('returns true for %s', (caseType) => {
		expect(isEnforcementCaseType(caseType)).toBe(true);
	});

	it.each([
		APPEAL_CASE_TYPE.D,
		APPEAL_CASE_TYPE.ZA,
		APPEAL_CASE_TYPE.ZP,
		APPEAL_CASE_TYPE.Y,
		APPEAL_CASE_TYPE.W,
		APPEAL_CASE_TYPE.X,
		undefined
	])('returns false for %s', (caseType) => {
		expect(isEnforcementCaseType(caseType)).toBe(false);
	});
});

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

describe('isLdcOrDiscontinuanceOrEnforcementCaseType', () => {
	it.each([APPEAL_CASE_TYPE.X, APPEAL_CASE_TYPE.G, APPEAL_CASE_TYPE.C, APPEAL_CASE_TYPE.F])(
		'returns true for %s',
		(caseType) => {
			expect(isLdcOrDiscontinuanceOrEnforcementCaseType(caseType)).toBe(true);
		}
	);

	it.each([
		APPEAL_CASE_TYPE.D,
		APPEAL_CASE_TYPE.ZA,
		APPEAL_CASE_TYPE.ZP,
		APPEAL_CASE_TYPE.Y,
		APPEAL_CASE_TYPE.H,
		APPEAL_CASE_TYPE.W,
		undefined
	])('returns false for %s', (caseType) => {
		expect(isLdcOrDiscontinuanceOrEnforcementCaseType(caseType)).toBe(false);
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

describe('isLdcCaseType', () => {
	it('returns true for X', () => {
		expect(isLdcCaseType(APPEAL_CASE_TYPE.X)).toBe(true);
	});

	it.each([
		APPEAL_CASE_TYPE.C,
		APPEAL_CASE_TYPE.G,
		APPEAL_CASE_TYPE.F,
		APPEAL_CASE_TYPE.D,
		APPEAL_CASE_TYPE.ZA,
		APPEAL_CASE_TYPE.ZP,
		APPEAL_CASE_TYPE.Y,
		APPEAL_CASE_TYPE.H,
		APPEAL_CASE_TYPE.W,
		undefined
	])('returns false for %s', (caseType) => {
		expect(isLdcCaseType(caseType)).toBe(false);
	});
});

describe('isLdcOrEnforcementCaseType', () => {
	it.each([APPEAL_CASE_TYPE.X, APPEAL_CASE_TYPE.C, APPEAL_CASE_TYPE.F])(
		'returns true for %s',
		(caseType) => {
			expect(isLdcOrEnforcementCaseType(caseType)).toBe(true);
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
	])('returns false for %s', (caseType) => {
		expect(isLdcOrEnforcementCaseType(caseType)).toBe(false);
	});
});

describe('isLdcOrEnforcementAppealType', () => {
	it.each([
		APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
		APPEAL_TYPE.ENFORCEMENT_NOTICE,
		APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
	])('returns true for %s', (appealType) => {
		expect(isLdcOrEnforcementAppealType(appealType)).toBe(true);
	});
	it.each([
		APPEAL_TYPE.HOUSEHOLDER,
		APPEAL_TYPE.DISCONTINUANCE_NOTICE,
		APPEAL_TYPE.ADVERTISEMENT,
		APPEAL_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY,
		APPEAL_TYPE.PLANNING_OBLIGATION,
		APPEAL_TYPE.AFFORDABLE_HOUSING_OBLIGATION,
		APPEAL_TYPE.CALL_IN_APPLICATION,
		APPEAL_TYPE.S78,
		APPEAL_TYPE.PLANNED_LISTED_BUILDING,
		APPEAL_TYPE.CAS_ADVERTISEMENT,
		APPEAL_TYPE.CAS_PLANNING
	])('returns false for %s', (appealType) => {
		expect(isLdcOrEnforcementAppealType(appealType)).toBe(false);
	});
});

describe('isNetResidencesAppealType', () => {
	it.each([APPEAL_TYPE.S78, APPEAL_TYPE.PLANNED_LISTED_BUILDING])(
		'returns true for %s',
		(appealType) => {
			expect(isNetResidencesAppealType(appealType)).toBe(true);
		}
	);

	it.each([
		APPEAL_TYPE.HOUSEHOLDER,
		APPEAL_TYPE.ADVERTISEMENT,
		APPEAL_TYPE.CAS_PLANNING,
		APPEAL_TYPE.CAS_ADVERTISEMENT,
		APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
		APPEAL_TYPE.DISCONTINUANCE_NOTICE,
		APPEAL_TYPE.ENFORCEMENT_NOTICE,
		APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING,
		undefined,
		null,
		''
	])('returns false for %s', (appealType) => {
		expect(isNetResidencesAppealType(appealType)).toBe(false);
	});
});

describe('isLinkedAppealsActiveForAppealOrCaseType', () => {
	const originalFeatureFlags = { ...apiConfig.featureFlags };

	afterEach(() => {
		Object.assign(apiConfig.featureFlags, originalFeatureFlags);
	});

	it('returns true when linked appeals feature is active but enforcement linked is not', () => {
		apiConfig.featureFlags[FEATURE_FLAG_NAMES.LINKED_APPEALS] = true;
		apiConfig.featureFlags[FEATURE_FLAG_NAMES.ENFORCEMENT_LINKED] = false;

		expect(isLinkedAppealsActiveForAppealOrCaseType(APPEAL_TYPE.HOUSEHOLDER)).toBe(true);
	});

	it.each([undefined, APPEAL_TYPE.ENFORCEMENT_NOTICE, APPEAL_CASE_TYPE.C])(
		'returns true when enforcement linked feature is active but linked appeals feature is not for %s',
		(type) => {
			apiConfig.featureFlags[FEATURE_FLAG_NAMES.LINKED_APPEALS] = false;
			apiConfig.featureFlags[FEATURE_FLAG_NAMES.ENFORCEMENT_LINKED] = true;

			expect(isLinkedAppealsActiveForAppealOrCaseType(type)).toBe(true);
		}
	);

	it('returns false when enforcement linked feature is active but linked appeals feature is not for a non-enforcement type', () => {
		apiConfig.featureFlags[FEATURE_FLAG_NAMES.LINKED_APPEALS] = false;
		apiConfig.featureFlags[FEATURE_FLAG_NAMES.ENFORCEMENT_LINKED] = true;

		expect(isLinkedAppealsActiveForAppealOrCaseType(APPEAL_TYPE.S78)).toBe(false);
	});

	it('returns false when both linked-appeal feature flags are inactive', () => {
		apiConfig.featureFlags[FEATURE_FLAG_NAMES.LINKED_APPEALS] = false;
		apiConfig.featureFlags[FEATURE_FLAG_NAMES.ENFORCEMENT_LINKED] = false;

		expect(isLinkedAppealsActiveForAppealOrCaseType()).toBe(false);
	});
});
