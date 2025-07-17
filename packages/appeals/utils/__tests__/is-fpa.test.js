import isFPA from '../is-fpa';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

describe('isFPA', () => {
	it('returns false for HAS appealType', () => {
		expect(isFPA(APPEAL_CASE_TYPE.D)).toBe(false);
	});

	it('returns false for CAS planning appealType', () => {
		expect(isFPA(APPEAL_CASE_TYPE.Z)).toBe(false);
	});

	it('returns false for empty string appealType', () => {
		expect(isFPA('')).toBe(false);
	});

	it('returns true for S78 appealType', () => {
		expect(isFPA(APPEAL_CASE_TYPE.W)).toBe(true);
	});

	it('returns true for S20 appealType', () => {
		expect(isFPA(APPEAL_CASE_TYPE.Y)).toBe(true);
	});

	it('throws an error for null appealType', () => {
		expect(() => isFPA(null)).toThrow('Appeal type - null not defined in isFPA baseCaseType');
	});

	it('throws an error for unknown appealType', () => {
		expect(() => isFPA(APPEAL_CASE_TYPE.C)).toThrow(
			'Appeal type - C not defined in isFPA baseCaseType'
		);
	});
});
