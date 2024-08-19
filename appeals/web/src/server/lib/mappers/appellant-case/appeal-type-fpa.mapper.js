import { removeSummaryListActions } from '#lib/mappers/mapper-utilities.js';
import { generateHASComponents } from './appeal-type-has.mapper.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent[]}
 */
export function generateFPAComponents(appealDetails, appellantCaseData, mappedAppellantCaseData) {
	const pageComponents = generateHASComponents(
		appealDetails,
		appellantCaseData,
		mappedAppellantCaseData
	);
	const applicationSummaryComponentIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' &&
			component.parameters.attributes?.id === 'application-summary'
	);

	if (applicationSummaryComponentIndex !== -1) {
		/**
		 * @type {PageComponent}
		 */
		const applicationSummary = {
			type: 'summary-list',
			parameters: {
				attributes: {
					id: 'application-summary'
				},
				card: {
					title: {
						text: '3. Application details'
					}
				},
				rows: [
					removeSummaryListActions(
						mappedAppellantCaseData.localPlanningAuthority.display.summaryListItem
					),
					removeSummaryListActions(
						mappedAppellantCaseData.applicationReference.display.summaryListItem
					),
					mappedAppellantCaseData.applicationDate.display.summaryListItem,
					mappedAppellantCaseData.applicationForm.display.summaryListItem,
					mappedAppellantCaseData.developmentDescription.display.summaryListItem,
					mappedAppellantCaseData.changedDevelopmentDescription.display.summaryListItem,
					mappedAppellantCaseData.changedDevelopmentDescriptionDocument.display.summaryListItem,
					mappedAppellantCaseData.designAccessStatement.display.summaryListItem,
					mappedAppellantCaseData.supportingDocuments.display.summaryListItem,
					mappedAppellantCaseData.applicationDecisionDate.display.summaryListItem,
					mappedAppellantCaseData.decisionLetter.display.summaryListItem,
					mappedAppellantCaseData.applicationDecision.display.summaryListItem
				]
			}
		};

		pageComponents[applicationSummaryComponentIndex] = applicationSummary;
	}

	const appealSummaryComponentIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' && component.parameters.attributes?.id === 'appeal-summary'
	);

	if (appealSummaryComponentIndex !== -1) {
		/**
		 * @type {PageComponent}
		 */
		const appealSummary = {
			type: 'summary-list',
			parameters: {
				attributes: {
					id: 'appeal-summary'
				},
				card: {
					title: {
						text: '4. Appeal details'
					}
				},
				rows: [
					removeSummaryListActions(mappedAppellantCaseData.appealType.display.summaryListItem),
					mappedAppellantCaseData.appealStatement.display.summaryListItem,
					mappedAppellantCaseData.relatedAppeals.display.summaryListItem,
					mappedAppellantCaseData.appellantCostsApplication.display.summaryListItem,
					mappedAppellantCaseData.costsDocument.display.summaryListItem,
					mappedAppellantCaseData.planningObligation.display.summaryListItem
				]
			}
		};

		pageComponents[appealSummaryComponentIndex] = appealSummary;
	}

	return pageComponents;
}
