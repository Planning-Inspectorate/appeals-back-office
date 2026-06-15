import { isDefined } from '#lib/ts-utilities.js';
import { generateSharedS78S20LpaQuestionnaireComponents } from './shared-s78-s20.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {{lpaq: MappedInstructions}} mappedLPAQData
 * @returns {PageComponent[]}
 */
export const generateS78ExpeditedLpaQuestionnaireComponents = (appealDetails, mappedLPAQData) => {
	/** @type {PageComponent[]} */
	const pageComponents = [];

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			attributes: {
				id: 'constraints-summary'
			},
			card: {
				title: {
					text: '1. Constraints, designations and other issues'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.isCorrectAppealType?.display.summaryListItem,
				mappedLPAQData.lpaq?.changedListedBuildingDetails?.display.summaryListItem,
				mappedLPAQData.lpaq?.affectsListedBuildingDetails?.display.summaryListItem,
				mappedLPAQData.lpaq?.affectsScheduledMonument?.display.summaryListItem,
				mappedLPAQData.lpaq?.conservationAreaMap?.display.summaryListItem,
				mappedLPAQData.lpaq?.hasProtectedSpecies?.display.summaryListItem,
				mappedLPAQData.lpaq?.siteWithinGreenBelt?.display.summaryListItem,
				mappedLPAQData.lpaq?.isAonbNationalLandscape?.display.summaryListItem,
				mappedLPAQData.lpaq?.inNearOrLikelyToAffectDesignatedSites?.display.summaryListItem,
				mappedLPAQData.lpaq?.treePreservationPlan?.display.summaryListItem,
				mappedLPAQData.lpaq?.isGypsyOrTravellerSite?.display.summaryListItem,
				mappedLPAQData.lpaq?.definitiveMapStatement?.display.summaryListItem
			].filter(isDefined)
		}
	});

	pageComponents.push(...generateSharedS78S20LpaQuestionnaireComponents(mappedLPAQData));

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			card: {
				title: {
					text: '8. Original Evidence'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.designAccessStatementLpa?.display.summaryListItem,
				mappedLPAQData.lpaq?.plansDrawingsLpa?.display.summaryListItem,
				mappedLPAQData.lpaq?.additionalDocumentsLpa?.display.summaryListItem,
				mappedLPAQData.lpaq?.listOfDocumentsBeforeDecision?.display.summaryListItem
			].filter(isDefined)
		}
	});

	return pageComponents;
};
