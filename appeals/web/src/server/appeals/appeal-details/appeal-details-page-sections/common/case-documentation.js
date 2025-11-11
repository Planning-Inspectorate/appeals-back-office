import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @returns {PageComponent}
 */
export const getCaseDocumentation = (mappedData, appealDetails) => {
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
				mappedData.appeal.lpaQuestionnaire.display.tableItem,
				...(!isChildAppeal(appealDetails)
					? [
							mappedData.appeal.lpaStatement.display.tableItem,
							mappedData.appeal.ipComments.display.tableItem,
							...(appealDetails.procedureType?.toLowerCase() !==
							APPEAL_CASE_PROCEDURE.INQUIRY.toLowerCase()
								? [
										mappedData.appeal.appellantFinalComments.display.tableItem,
										mappedData.appeal.lpaFinalComments.display.tableItem
								  ]
								: []),
							mappedData.appeal.appellantProofOfEvidence.display.tableItem,
							mappedData.appeal.lpaProofOfEvidence.display.tableItem
					  ]
					: []),
				mappedData.appeal.environmentalAssessment.display.tableItem
			].filter(isDefined),
			firstCellIsHeader: true
		},
		wrapperHtml: {
			opening: '<h2 class="govuk-heading-l">Documentation</h2>',
			closing: '',
			id: 'case-documentation'
		}
	};
};
