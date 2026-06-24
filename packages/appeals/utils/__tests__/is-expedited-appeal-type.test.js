import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_TYPE,
	APPEAL_TYPE_OF_PLANNING_APPLICATION
} from '@planning-inspectorate/data-model';
import { APPEAL_TYPE, PROCEDURE_TYPE_NAME } from '../../constants/common';
import {
	isExpeditedAppealType,
	isS78ExpeditedAppealType,
	normalizeProcedureType
} from '../appeal-type-checks';

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

	it('returns true if appealType is S78, planning application is MINOR_COMMERCIAL_DEVELOPMENT, and decision is granted', () => {
		expect(
			isS78ExpeditedAppealType(
				APPEAL_TYPE.S78,
				'2026-04-02',
				'granted',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.MINOR_COMMERCIAL_DEVELOPMENT
			)
		).toBe(true);
	});

	it('returns false if appealType is S78, planning application is MINOR_COMMERCIAL_DEVELOPMENT, and decision is refused', () => {
		expect(
			isS78ExpeditedAppealType(
				APPEAL_TYPE.S78,
				'2026-04-02',
				'refused',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.MINOR_COMMERCIAL_DEVELOPMENT
			)
		).toBe(false);
	});

	it('returns true if appealType is S78, planning application is HOUSEHOLDER_PLANNING, and decision is granted', () => {
		expect(
			isS78ExpeditedAppealType(
				APPEAL_TYPE.S78,
				'2026-04-02',
				'granted',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.HOUSEHOLDER_PLANNING
			)
		).toBe(true);
	});

	it('returns false if appealType is S78, planning application is HOUSEHOLDER_PLANNING, and decision is refused', () => {
		expect(
			isS78ExpeditedAppealType(
				APPEAL_TYPE.S78,
				'2026-04-02',
				'refused',
				APPEAL_TYPE_OF_PLANNING_APPLICATION.HOUSEHOLDER_PLANNING
			)
		).toBe(false);
	});

	describe('prior-approval', () => {
		it('returns true when decision is GRANTED and date is on/after cutoff', () => {
			expect(
				isS78ExpeditedAppealType(
					APPEAL_TYPE.S78,
					'2026-04-02',
					'granted',
					APPEAL_TYPE_OF_PLANNING_APPLICATION.PRIOR_APPROVAL
				)
			).toBe(true);
		});

		it('returns true when decision is REFUSED and date is on/after cutoff', () => {
			expect(
				isS78ExpeditedAppealType(
					APPEAL_TYPE.S78,
					'2026-04-02',
					'refused',
					APPEAL_TYPE_OF_PLANNING_APPLICATION.PRIOR_APPROVAL
				)
			).toBe(true);
		});

		it('returns false when decision is not granted or refused', () => {
			expect(
				isS78ExpeditedAppealType(
					APPEAL_TYPE.S78,
					'2026-04-02',
					'not_decided',
					APPEAL_TYPE_OF_PLANNING_APPLICATION.PRIOR_APPROVAL
				)
			).toBe(false);
		});
	});
});

describe('normalizeProcedureType', () => {
	it('normalizes WRITTEN_PART_1 to WRITTEN', () => {
		expect(normalizeProcedureType(APPEAL_CASE_PROCEDURE.WRITTEN_PART_1)).toBe(
			APPEAL_CASE_PROCEDURE.WRITTEN
		);
	});

	it('normalizes WRITTEN_PART_2 to WRITTEN', () => {
		expect(normalizeProcedureType(APPEAL_CASE_PROCEDURE.WRITTEN_PART_2)).toBe(
			APPEAL_CASE_PROCEDURE.WRITTEN
		);
	});

	it('normalizes PROCEDURE_TYPE_NAME.WRITTEN_PART_1 display name to WRITTEN key', () => {
		expect(normalizeProcedureType(PROCEDURE_TYPE_NAME.WRITTEN_PART_1)).toBe(
			APPEAL_CASE_PROCEDURE.WRITTEN
		);
	});

	it('normalizes PROCEDURE_TYPE_NAME.WRITTEN_PART_2 display name to WRITTEN key', () => {
		expect(normalizeProcedureType(PROCEDURE_TYPE_NAME.WRITTEN_PART_2)).toBe(
			APPEAL_CASE_PROCEDURE.WRITTEN
		);
	});

	it('returns the procedure type unchanged if it is not WRITTEN_PART_1 or WRITTEN_PART_2', () => {
		expect(normalizeProcedureType(APPEAL_CASE_PROCEDURE.HEARING)).toBe(
			APPEAL_CASE_PROCEDURE.HEARING
		);
		expect(normalizeProcedureType(APPEAL_CASE_PROCEDURE.INQUIRY)).toBe(
			APPEAL_CASE_PROCEDURE.INQUIRY
		);
		expect(normalizeProcedureType(APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
			APPEAL_CASE_PROCEDURE.WRITTEN
		);
		expect(normalizeProcedureType(null)).toBe(null);
		expect(normalizeProcedureType(undefined)).toBe(undefined);
	});
});
