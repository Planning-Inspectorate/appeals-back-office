import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { appealTypeToAppealCaseTypeMapper } from '../appeal-type-case.mapper.js';
import askEnvironmentServiceTeamReviewQuestion from '../ask-environment-service-team-review-question';

describe('askEnvironmentServiceTeamReviewQuestion', () => {
	it('returns false for expedited appeal types (HAS, CAS planning and CAS adverts)', () => {
		expect(askEnvironmentServiceTeamReviewQuestion(APPEAL_TYPE.HOUSEHOLDER)).toBe(false);
		expect(askEnvironmentServiceTeamReviewQuestion(APPEAL_TYPE.CAS_PLANNING)).toBe(false);
		expect(askEnvironmentServiceTeamReviewQuestion(APPEAL_TYPE.CAS_ADVERTISEMENT)).toBe(false);
	});

	it('returns false for full adverts, LDC (once enabled) and discontinuance (once enabled)', () => {
		expect(askEnvironmentServiceTeamReviewQuestion(APPEAL_TYPE.ADVERTISEMENT)).toBe(false);
		// expect(askEnvironmentServiceTeamReviewQuestion(APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE)).toBe(false);
		// expect(askEnvironmentServiceTeamReviewQuestion(APPEAL_TYPE.DISCONTINUANCE_NOTICE)).toBe(false);
	});

	it('returns true for S78, S20, enforcement and enforcement listed building (once enabled)', () => {
		expect(askEnvironmentServiceTeamReviewQuestion(APPEAL_TYPE.S78)).toBe(true);
		expect(askEnvironmentServiceTeamReviewQuestion(APPEAL_TYPE.PLANNED_LISTED_BUILDING)).toBe(true);
		expect(askEnvironmentServiceTeamReviewQuestion(APPEAL_TYPE.ENFORCEMENT_NOTICE)).toBe(true);
		// expect(askEnvironmentServiceTeamReviewQuestion(APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING)).toBe(true);
	});

	it('throws an error for appeal types (LDC, discontinuance and enforcement listed building) which are currently not handled by isExpeditedAppealType', () => {
		expect(() =>
			askEnvironmentServiceTeamReviewQuestion(APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING)
		).toThrow(
			`Appeal type - ${appealTypeToAppealCaseTypeMapper(
				APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
			)} not defined in isExpeditedAppealType baseCaseType`
		);
		expect(() =>
			askEnvironmentServiceTeamReviewQuestion(APPEAL_TYPE.DISCONTINUANCE_NOTICE)
		).toThrow(
			`Appeal type - ${appealTypeToAppealCaseTypeMapper(
				APPEAL_TYPE.DISCONTINUANCE_NOTICE
			)} not defined in isExpeditedAppealType baseCaseType`
		);
	});

	it('throws an error for empty string', () => {
		expect(() => askEnvironmentServiceTeamReviewQuestion('')).toThrow(
			'Appeal type -  not defined in askEnvironmentServiceTeamReviewQuestion'
		);
	});

	it('throws an error for unrecognized string', () => {
		expect(() => askEnvironmentServiceTeamReviewQuestion('not-a-type')).toThrow(
			'Appeal type - not-a-type is not a valid appeal type in askEnvironmentServiceTeamReviewQuestion'
		);
	});
});
