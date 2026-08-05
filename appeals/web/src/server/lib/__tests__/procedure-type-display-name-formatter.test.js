import { appealProcedureKeyToLabelText } from '#lib/procedure-type-display-name-formatter.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

describe('appealProcedureKeyToLabelText', () => {
	describe('when showPart1 is true', () => {
		const showPart1 = true;

		test('returns Part 2 label for written procedure radio button', () => {
			expect(
				appealProcedureKeyToLabelText(APPEAL_CASE_PROCEDURE.WRITTEN, APPEAL_TYPE.S78, showPart1)
			).toBe('Written representations (Part 2)');
		});

		test('returns Part 1 label for written expedited procedure radio button', () => {
			expect(
				appealProcedureKeyToLabelText(
					APPEAL_CASE_PROCEDURE.WRITTEN_PART_1,
					APPEAL_TYPE.S78,
					showPart1
				)
			).toBe('Written representations (Part 1)');
		});

		test.each([
			[APPEAL_CASE_PROCEDURE.HEARING, 'Hearing'],
			[APPEAL_CASE_PROCEDURE.INQUIRY, 'Inquiry']
		])(
			'returns a capitalized procedure type label for %s radio button',
			(procedureTypeKey, expected) => {
				expect(appealProcedureKeyToLabelText(procedureTypeKey, APPEAL_TYPE.S78, showPart1)).toBe(
					expected
				);
			}
		);

		test('returns empty string for unknown procedure type', () => {
			expect(appealProcedureKeyToLabelText('unknown-procedure', APPEAL_TYPE.S78, showPart1)).toBe(
				''
			);
		});
	});

	describe('when showPart1 is false', () => {
		const showPart1 = false;

		test('returns written representations without part 2 label for written procedure radio button', () => {
			expect(
				appealProcedureKeyToLabelText(APPEAL_CASE_PROCEDURE.WRITTEN, APPEAL_TYPE.S78, showPart1)
			).toBe('Written representations');
		});
	});
});
