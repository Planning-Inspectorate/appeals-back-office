import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { PROCEDURE_TYPE_NAME } from '../../constants/common.js';
import { normaliseProcedureType } from '../procedure-type.js';

describe('normaliseProcedureType', () => {
	it('normalises WRITTEN_PART_1 to WRITTEN', () => {
		expect(normaliseProcedureType(APPEAL_CASE_PROCEDURE.WRITTEN_PART_1)).toBe(
			APPEAL_CASE_PROCEDURE.WRITTEN
		);
	});

	it('normalises WRITTEN_PART_2 to WRITTEN', () => {
		expect(normaliseProcedureType(APPEAL_CASE_PROCEDURE.WRITTEN_PART_2)).toBe(
			APPEAL_CASE_PROCEDURE.WRITTEN
		);
	});

	it('normalises PROCEDURE_TYPE_NAME.WRITTEN_PART_1 display name to WRITTEN key', () => {
		expect(normaliseProcedureType(PROCEDURE_TYPE_NAME.WRITTEN_PART_1)).toBe(
			APPEAL_CASE_PROCEDURE.WRITTEN
		);
	});

	it('normalises PROCEDURE_TYPE_NAME.WRITTEN_PART_2 display name to WRITTEN key', () => {
		expect(normaliseProcedureType(PROCEDURE_TYPE_NAME.WRITTEN_PART_2)).toBe(
			APPEAL_CASE_PROCEDURE.WRITTEN
		);
	});

	it('normalises PROCEDURE_TYPE_NAME.HEARING display name to HEARING key', () => {
		expect(normaliseProcedureType(PROCEDURE_TYPE_NAME.HEARING)).toBe(APPEAL_CASE_PROCEDURE.HEARING);
	});

	it('normalises PROCEDURE_TYPE_NAME.INQUIRY display name to INQUIRY key', () => {
		expect(normaliseProcedureType(PROCEDURE_TYPE_NAME.INQUIRY)).toBe(APPEAL_CASE_PROCEDURE.INQUIRY);
	});

	it('returns the procedure type unchanged if it is not WRITTEN_PART_1 or WRITTEN_PART_2, HEARING or INQUIRY', () => {
		expect(normaliseProcedureType(APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
			APPEAL_CASE_PROCEDURE.WRITTEN
		);

		expect(normaliseProcedureType('testString')).toBe('testString');
		expect(normaliseProcedureType(undefined)).toBe(undefined);
	});
});
