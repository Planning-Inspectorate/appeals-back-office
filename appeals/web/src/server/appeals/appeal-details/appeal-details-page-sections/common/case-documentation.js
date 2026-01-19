import { APPEAL_CASE_PRE_STATEMENTS_STATUS } from '#appeals/appeal.constants.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @returns {PageComponent}
 */
export const getCaseDocumentation = (mappedData, appealDetails) => {
	const caseStarted = appealDetails.startedAt;
	const inquiryEventSetUp = appealDetails.inquiry;
	const isInquiryProcedureType =
		appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY.toLowerCase();
	const statementsCompleted = !APPEAL_CASE_PRE_STATEMENTS_STATUS.includes(
		appealDetails?.appealStatus
	);

	return {
		type: 'table',
		parameters: {
			head: [
				{ text: 'Documentation' },
				{ text: 'Status' },
				{ text: 'Date' },
				{ text: 'Action', classes: 'govuk-!-text-align-right' }
			],
			rows: [
				mappedData.appeal.appellantCase.display.tableItem,
				caseStarted ? mappedData.appeal.lpaQuestionnaire.display.tableItem : [],
				...(!isChildAppeal(appealDetails)
					? [
							mappedData.appeal.appellantStatement.display.tableItem || [],
							caseStarted ? mappedData.appeal.lpaStatement.display.tableItem : [],
							...(mappedData.appeal.rule6PartyStatements?.display?.tableItems || []),
							caseStarted ? mappedData.appeal.ipComments.display.tableItem : [],
							...(caseStarted && !isInquiryProcedureType && statementsCompleted
								? [
										mappedData.appeal.appellantFinalComments.display.tableItem,
										mappedData.appeal.lpaFinalComments.display.tableItem
									]
								: []),
							...(caseStarted && isInquiryProcedureType && inquiryEventSetUp
								? [
										mappedData.appeal.appellantProofOfEvidence.display.tableItem || [],
										mappedData.appeal.lpaProofOfEvidence.display.tableItem || []
									]
								: []),
							...(mappedData.appeal.rule6PartyProofs?.display?.tableItems || [])
						]
					: []),
				mappedData.appeal.environmentalAssessment.display.tableItem
			].filter(isDefined),
			firstCellIsHeader: true,
			attributes: {
				id: 'case-documentation-table'
			}
		},
		wrapperHtml: {
			opening: '<h2 class="govuk-heading-l">Documentation</h2>',
			closing: '',
			id: 'case-documentation'
		}
	};
};
