import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import isExpeditedAppealType from '../is-expedited-appeal-type';

describe('isExpeditedAppealType', () => {
	it('returns true for HAS appealType', () => {
		expect(isExpeditedAppealType(APPEAL_CASE_TYPE.D)).toBe(true);
	});

	it('returns true for CAS planning appealType', () => {
		expect(isExpeditedAppealType(APPEAL_CASE_TYPE.ZP)).toBe(true);
	});
	it('returns true for CAS advert appealType', () => {
		expect(isExpeditedAppealType(APPEAL_CASE_TYPE.ZA)).toBe(true);
	});

	it('returns false for empty string appealType', () => {
		expect(isExpeditedAppealType('')).toBe(false);
	});

	it('returns false for S78 appealType', () => {
		expect(isExpeditedAppealType(APPEAL_CASE_TYPE.W)).toBe(false);
	});

	it('returns false for S20 appealType', () => {
		expect(isExpeditedAppealType(APPEAL_CASE_TYPE.Y)).toBe(false);
	});

	it('returns true for advert appealType', () => {
		expect(isExpeditedAppealType(APPEAL_CASE_TYPE.H)).toBe(true);
	});

	it('returns false for enforcement notice appealType', () => {
		expect(isExpeditedAppealType(APPEAL_CASE_TYPE.C)).toBe(false);
	});

	it('throws an error for null appealType', () => {
		expect(() => isExpeditedAppealType(null)).toThrow(
			'Appeal type - null not defined in isExpeditedAppealType baseCaseType'
		);
	});
});
