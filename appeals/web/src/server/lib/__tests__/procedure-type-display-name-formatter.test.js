import { appealProcedureKeyToLabelText } from '#lib/procedure-type-display-name-formatter.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

describe('appealProcedureKeyToLabelText', () => {
	test.each([
		[APPEAL_TYPE.S78, 'Written representations (Part 2)'],
		[APPEAL_TYPE.S78_EXPEDITED, 'Written representations (Part 2)'],
		[APPEAL_TYPE.HOUSEHOLDER, 'Written representations'],
		[APPEAL_TYPE.ENFORCEMENT, 'Written representations'],
		[undefined, 'Written representations']
	])(
		'returns the correct label for written procedure when appeal type is %s',
		(appealType, expected) => {
			expect(appealProcedureKeyToLabelText(APPEAL_CASE_PROCEDURE.WRITTEN, appealType)).toBe(
				expected
			);
		}
	);

	test('returns Part 1 label for written part 1 procedure', () => {
		expect(
			appealProcedureKeyToLabelText(APPEAL_CASE_PROCEDURE.WRITTEN_PART_1, APPEAL_TYPE.S78)
		).toBe('Written representations (Part 1)');
	});

	test.each([
		[APPEAL_CASE_PROCEDURE.HEARING, 'Hearing'],
		[APPEAL_CASE_PROCEDURE.INQUIRY, 'Inquiry']
	])('returns a capitalized procedure type label for %s', (procedureTypeKey, expected) => {
		expect(appealProcedureKeyToLabelText(procedureTypeKey, APPEAL_TYPE.S78)).toBe(expected);
	});

	test('returns empty string for unknown procedure type', () => {
		expect(appealProcedureKeyToLabelText('unknown-procedure', APPEAL_TYPE.S78)).toBe('');
	});
});
