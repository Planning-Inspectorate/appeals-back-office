import { getNextStateDisplayTextOnStatementsComplete } from '#lib/appeal-status.js';
import { APPEAL_TYPE, PROCEDURE_TYPE_NAME } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

describe('getNextStateDisplayTextOnStatementsComplete', () => {
	describe.each([APPEAL_TYPE.S78, APPEAL_TYPE.PLANNED_LISTED_BUILDING, APPEAL_TYPE.ADVERTISEMENT])(
		'Appeal type %s',
		(appealType) => {
			it.each([
				['final comments', APPEAL_CASE_PROCEDURE.WRITTEN, false],
				['final comments', PROCEDURE_TYPE_NAME.WRITTEN_PART_1, false],
				['final comments', PROCEDURE_TYPE_NAME.WRITTEN_PART_2, false],
				['hearing ready to set up', APPEAL_CASE_PROCEDURE.HEARING, false],
				['hearing ready to set up', PROCEDURE_TYPE_NAME.HEARING, false],
				['awaiting hearing', APPEAL_CASE_PROCEDURE.HEARING, true],
				['awaiting hearing', PROCEDURE_TYPE_NAME.HEARING, true],
				['proof of evidence and witnesses', APPEAL_CASE_PROCEDURE.INQUIRY, false],
				['proof of evidence and witnesses', PROCEDURE_TYPE_NAME.INQUIRY, false]
			])(
				'returns %s when procedure is %s and hearing is set up = %s',
				async (expectedText, procedureType, hearingSetUp) => {
					expect(
						getNextStateDisplayTextOnStatementsComplete(appealType, procedureType, hearingSetUp)
					).toBe(expectedText);
				}
			);
		}
	);

	describe.each([
		APPEAL_TYPE.ENFORCEMENT_NOTICE,
		APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING,
		APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE
	])('Appeal type %s', (appealType) => {
		it.each([
			['final comments', APPEAL_CASE_PROCEDURE.WRITTEN, false],
			['final comments', PROCEDURE_TYPE_NAME.WRITTEN_PART_1, false],
			['final comments', PROCEDURE_TYPE_NAME.WRITTEN_PART_2, false],
			['final comments', APPEAL_CASE_PROCEDURE.HEARING, false],
			['final comments', PROCEDURE_TYPE_NAME.HEARING, false],
			['final comments', APPEAL_CASE_PROCEDURE.HEARING, true],
			['final comments', PROCEDURE_TYPE_NAME.HEARING, true],
			['final comments', APPEAL_CASE_PROCEDURE.INQUIRY, false],
			['final comments', PROCEDURE_TYPE_NAME.INQUIRY, false]
		])(
			'returns %s when procedure is %s and hearing is set up = %s',
			async (expectedText, procedureType, hearingSetUp) => {
				expect(
					getNextStateDisplayTextOnStatementsComplete(appealType, procedureType, hearingSetUp)
				).toBe(expectedText);
			}
		);
	});
});
