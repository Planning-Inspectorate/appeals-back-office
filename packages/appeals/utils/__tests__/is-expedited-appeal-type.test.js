import {
	APPEAL_CASE_TYPE,
	APPEAL_TYPE_OF_PLANNING_APPLICATION
} from '@planning-inspectorate/data-model';
import { APPEAL_TYPE } from '../../constants/common';
import { isExpeditedAppealType, isS78ExpeditedAppealType } from '../appeal-type-checks';

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

	it('returns false for advert appealType', () => {
		expect(isExpeditedAppealType(APPEAL_CASE_TYPE.H)).toBe(false);
	});

	it('returns false for enforcement notice appealType', () => {
		expect(isExpeditedAppealType(APPEAL_CASE_TYPE.C)).toBe(false);
	});

	it('returns false for LDC appealType', () => {
		expect(isExpeditedAppealType(APPEAL_CASE_TYPE.X)).toBe(false);
	});
});

describe('isS78ExpeditedAppealType', () => {
	it('returns true if appealType is S78, date is after 2026-04-01 and decision is refused', () => {
		expect(
			isS78ExpeditedAppealType(
				APPEAL_TYPE.S78,
				'2026-04-02',
				'refused',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(true);
	});

	it('returns true if appealType is S78, date is after 2026-04-01 and decision is granted', () => {
		expect(
			isS78ExpeditedAppealType(
				APPEAL_TYPE.S78,
				'2026-04-02',
				'granted',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(true);
	});

	it('returns true if appealType is W, date is after 2026-04-01 and decision is refused', () => {
		expect(
			isS78ExpeditedAppealType(
				APPEAL_CASE_TYPE.W,
				'2026-04-02',
				'refused',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(true);
	});

	it('returns false if appealType is not S78 or W', () => {
		expect(
			isS78ExpeditedAppealType(
				APPEAL_CASE_TYPE.D,
				'2026-04-02',
				'refused',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(false);
		expect(
			isS78ExpeditedAppealType(
				APPEAL_CASE_TYPE.H,
				'2026-04-02',
				'refused',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(false);
		expect(
			isS78ExpeditedAppealType(
				APPEAL_CASE_TYPE.Y,
				'2026-04-02',
				'refused',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(false);
		expect(
			isS78ExpeditedAppealType(
				APPEAL_CASE_TYPE.X,
				'2026-04-02',
				'refused',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(false);
		expect(
			isS78ExpeditedAppealType(
				APPEAL_CASE_TYPE.F,
				'2026-04-02',
				'refused',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(false);
		expect(
			isS78ExpeditedAppealType(
				APPEAL_CASE_TYPE.C,
				'2026-04-02',
				'refused',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(false);
	});

	it('returns false if date is before 2026-04-01', () => {
		expect(
			isS78ExpeditedAppealType(
				APPEAL_TYPE.S78,
				'2026-03-31',
				'refused',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(false);
	});

	it('returns false if decision is not refused or granted', () => {
		expect(
			isS78ExpeditedAppealType(
				APPEAL_TYPE.S78,
				'2026-04-02',
				'not_decided',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(false);
	});

	it('returns false if appealType is null', () => {
		expect(
			isS78ExpeditedAppealType(
				null,
				'2026-04-02',
				'refused',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
			)
		).toBe(false);
	});
});
