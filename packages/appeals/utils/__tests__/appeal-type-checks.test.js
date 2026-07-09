import { APPEAL_TYPE } from '../../constants/common';
import {
	isAnyEnforcementAppealType,
	isLdcOrDiscontinuanceOrEnforcementAppealType
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
