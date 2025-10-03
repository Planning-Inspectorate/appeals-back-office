import { isDefined } from '#lib/ts-utilities.js';
import { generateSharedS78S20LpaQuestionnaireComponents } from './shared-s78-s20.js';

/**
 *
 * @param {{lpaq: MappedInstructions}} mappedLPAQData
 * @param {{appeal: MappedInstructions}} mappedAppealDetails
 * @returns {PageComponent[]}
 */
export const generateS20LpaQuestionnaireComponents = (mappedLPAQData, mappedAppealDetails) => {
	/** @type {PageComponent[]} */
	const pageComponents = [];

	const rows = [
		mappedLPAQData.lpaq?.isCorrectAppealType?.display.summaryListItem,
		mappedLPAQData.lpaq?.changedListedBuildingDetails?.display.summaryListItem,
		mappedLPAQData.lpaq?.affectsListedBuildingDetails?.display.summaryListItem,
		mappedLPAQData.lpaq?.grantLoanToPreserve?.display.summaryListItem,
		mappedLPAQData.lpaq?.affectsScheduledMonument?.display.summaryListItem,
		mappedLPAQData.lpaq?.conservationAreaMap?.display.summaryListItem,
		mappedLPAQData.lpaq?.hasProtectedSpecies?.display.summaryListItem,
		mappedLPAQData.lpaq?.siteWithinGreenBelt?.display.summaryListItem,
		mappedLPAQData.lpaq?.isAonbNationalLandscape?.display.summaryListItem,
		mappedLPAQData.lpaq?.inNearOrLikelyToAffectDesignatedSites?.display.summaryListItem,
		mappedLPAQData.lpaq?.treePreservationPlan?.display.summaryListItem,
		mappedLPAQData.lpaq?.isGypsyOrTravellerSite?.display.summaryListItem,
		mappedLPAQData.lpaq?.definitiveMapStatement?.display.summaryListItem,
		mappedLPAQData.lpaq?.historicEnglandConsultation?.display.summaryListItem
	];

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
			rows: [...rows].filter(isDefined)
		}
	});

	pageComponents.push(
		...generateSharedS78S20LpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails)
	);

	return pageComponents;
};
