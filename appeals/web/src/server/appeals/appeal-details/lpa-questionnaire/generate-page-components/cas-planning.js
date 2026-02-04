import { isDefined } from '#lib/ts-utilities.js';

/**
 *
 * @param {{lpaq: MappedInstructions}} mappedLPAQData
 * @param {{appeal: MappedInstructions}} mappedAppealDetails
 * @returns {PageComponent[]}
 */
export const generateCasPlanningLpaQuestionnaireComponents = (
	mappedLPAQData,
	mappedAppealDetails
) => {
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
				mappedLPAQData.lpaq?.affectsListedBuildingDetails?.display.summaryListItem,
				mappedLPAQData.lpaq?.conservationAreaMap?.display.summaryListItem,
				mappedLPAQData.lpaq?.siteWithinGreenBelt?.display.summaryListItem
			].filter(isDefined)
		}
	});

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
					text: '2. Notifying relevant parties'
				}
			},
			attributes: {
				id: 'notifications-summary'
			},
			rows: [
				mappedLPAQData.lpaq?.notificationMethods?.display.summaryListItem,
				mappedLPAQData.lpaq?.siteNotice?.display.summaryListItem,
				mappedLPAQData.lpaq?.lettersToNeighbours?.display.summaryListItem,
				mappedLPAQData.lpaq?.pressAdvert?.display.summaryListItem,
				mappedLPAQData.lpaq?.notifyingParties?.display.summaryListItem,
				mappedLPAQData.lpaq?.appealNotification?.display.summaryListItem
			].filter(isDefined)
		}
	});

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
					text: '3. Consultation responses and representations'
				}
			},
			attributes: {
				id: 'representations-summary'
			},
			rows: [mappedLPAQData.lpaq?.representations?.display.summaryListItem].filter(isDefined)
		}
	});

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
					text: '4. Planning officer’s report and supplementary documents'
				}
			},
			attributes: {
				id: 'supplementary-documents-summary'
			},
			rows: [
				mappedLPAQData.lpaq?.officersReport?.display.summaryListItem,
				mappedLPAQData.lpaq?.developmentPlanPolicies?.display.summaryListItem,
				mappedLPAQData.lpaq?.emergingPlan?.display.summaryListItem,
				mappedLPAQData.lpaq?.supplementaryPlanning?.display.summaryListItem
			].filter(isDefined)
		}
	});

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
					text: '5. Site access'
				}
			},
			attributes: {
				id: 'site-access-summary'
			},
			rows: [
				mappedLPAQData.lpaq?.siteAccess?.display.summaryListItem,
				mappedAppealDetails.appeal.lpaNeighbouringSites?.display.summaryListItem,
				mappedLPAQData.lpaq?.lpaHealthAndSafety?.display.summaryListItem
			].filter(isDefined)
		}
	});

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
					text: '6. Appeal process'
				}
			},
			attributes: {
				id: 'appeal-process-summary'
			},
			rows: [
				mappedLPAQData.lpaq?.otherAppeals?.display.summaryListItem,
				mappedLPAQData.lpaq?.extraConditions?.display.summaryListItem
			].filter(isDefined)
		}
	});

	return pageComponents;
};
