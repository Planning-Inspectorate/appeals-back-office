import { APPEAL_CASE_PRE_STATEMENTS_STATUS } from '#appeals/appeal.constants.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { isDefined } from '#lib/ts-utilities.js';
import { PROCEDURE_TYPE_NAME } from '@pins/appeals/constants/common.js';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @returns {PageComponent}
 */
export const getCaseDocumentation = (mappedData, appealDetails) => {
	const caseStarted = appealDetails.startedAt;
	const inquiryEventSetUp = appealDetails.inquiry;
	const isInquiryProcedureType = appealDetails.procedureType === PROCEDURE_TYPE_NAME.INQUIRY;
	const isExpeditedAppealType = appealDetails.procedureType === PROCEDURE_TYPE_NAME.WRITTEN_PART_1;
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
				caseStarted ? mappedData.appeal.lpaQuestionnaire.display.tableItem : undefined,
				...(!isChildAppeal(appealDetails) && !isExpeditedAppealType
					? [
							caseStarted ? mappedData.appeal.appellantStatement.display.tableItem : undefined,
							caseStarted ? mappedData.appeal.lpaStatement.display.tableItem : undefined,
							...(mappedData.appeal.rule6PartyStatements?.display?.tableItems || []),
							caseStarted ? mappedData.appeal.ipComments.display.tableItem : undefined,
							...(caseStarted && !isInquiryProcedureType && statementsCompleted
								? [
										mappedData.appeal.appellantFinalComments.display.tableItem,
										mappedData.appeal.lpaFinalComments.display.tableItem
									]
								: []),
							...(caseStarted && isInquiryProcedureType && inquiryEventSetUp
								? [
										mappedData.appeal.appellantProofOfEvidence.display.tableItem || [],
										mappedData.appeal.lpaProofOfEvidence.display.tableItem || [],
										...(mappedData.appeal.rule6PartyProofs?.display?.tableItems || [])
									]
								: [])
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
