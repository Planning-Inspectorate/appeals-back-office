import {
	appealProcedureKeyToLabelText,
	replaceProcedureTypeWithLabelInAuditText
} from '#lib/procedure-type-display-name-formatter.js';
import {
	PROCEDURE_TYPE_KEY,
	PROCEDURE_TYPE_LABEL,
	PROCEDURE_TYPE_NAME
} from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

describe('appealProcedureKeyToLabelText', () => {
	describe('when showPart1 is true', () => {
		const showPart1 = true;

		test('returns Part 2 label for written procedure radio button', () => {
			expect(appealProcedureKeyToLabelText(APPEAL_CASE_PROCEDURE.WRITTEN, showPart1)).toBe(
				'Written representations (part 2)'
			);
		});

		test('returns Part 1 label for written expedited procedure radio button', () => {
			expect(appealProcedureKeyToLabelText(APPEAL_CASE_PROCEDURE.WRITTEN_PART_1, showPart1)).toBe(
				'Written representations (part 1)'
			);
		});

		test.each([
			[APPEAL_CASE_PROCEDURE.HEARING, 'Hearing'],
			[APPEAL_CASE_PROCEDURE.INQUIRY, 'Inquiry']
		])(
			'returns a capitalized procedure type label for %s radio button',
			(procedureTypeKey, expected) => {
				expect(appealProcedureKeyToLabelText(procedureTypeKey, showPart1)).toBe(expected);
			}
		);

		test('returns empty string for unknown procedure type', () => {
			expect(appealProcedureKeyToLabelText('unknown-procedure', showPart1)).toBe('');
		});
	});

	describe('when showPart1 is false', () => {
		const showPart1 = false;

		test('returns written representations without part 2 label for written procedure radio button', () => {
			expect(appealProcedureKeyToLabelText(APPEAL_CASE_PROCEDURE.WRITTEN, showPart1)).toBe(
				'Written representations'
			);
		});
	});
});

describe('replaceProcedureTypeWithLabelInAuditText', () => {
	test.each([
		[PROCEDURE_TYPE_NAME.WRITTEN_PART_1, PROCEDURE_TYPE_LABEL.WRITTEN_PART_1],
		[PROCEDURE_TYPE_KEY.WRITTEN_PART_1, PROCEDURE_TYPE_LABEL.WRITTEN_PART_1],
		[APPEAL_CASE_PROCEDURE.WRITTEN_PART_1, PROCEDURE_TYPE_LABEL.WRITTEN_PART_1],
		[PROCEDURE_TYPE_NAME.WRITTEN_PART_2, PROCEDURE_TYPE_LABEL.WRITTEN_PART_2],
		[PROCEDURE_TYPE_KEY.WRITTEN_PART_2, PROCEDURE_TYPE_LABEL.WRITTEN_PART_2],
		[APPEAL_CASE_PROCEDURE.WRITTEN_PART_2, PROCEDURE_TYPE_LABEL.WRITTEN_PART_2],
		[PROCEDURE_TYPE_NAME.WRITTEN, PROCEDURE_TYPE_LABEL.WRITTEN],
		[PROCEDURE_TYPE_KEY.WRITTEN, PROCEDURE_TYPE_LABEL.WRITTEN],
		[APPEAL_CASE_PROCEDURE.WRITTEN, PROCEDURE_TYPE_LABEL.WRITTEN]
	])('replaces procedure type "%s" with label "%s"', (procedureType, label) => {
		expect(
			replaceProcedureTypeWithLabelInAuditText(`Appeal procedure changed to ${procedureType}`)
		).toBe(`Appeal procedure changed to ${label}`);
	});

	test('returns the text unchanged when no procedure type is present', () => {
		const detailsHtml = 'The case officer was updated';
		expect(replaceProcedureTypeWithLabelInAuditText(detailsHtml)).toBe(detailsHtml);
	});

	test('replaces only the first matching procedure type occurrence', () => {
		expect(
			replaceProcedureTypeWithLabelInAuditText(
				`${PROCEDURE_TYPE_KEY.WRITTEN} then ${PROCEDURE_TYPE_KEY.WRITTEN}`
			)
		).toBe(`${PROCEDURE_TYPE_LABEL.WRITTEN} then ${PROCEDURE_TYPE_KEY.WRITTEN}`);
	});
});
