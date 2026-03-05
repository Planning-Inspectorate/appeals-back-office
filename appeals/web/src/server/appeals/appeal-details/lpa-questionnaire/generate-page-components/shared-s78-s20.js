import { isDefined } from '#lib/ts-utilities.js';

/**
 *
 * @param {{lpaq: MappedInstructions}} mappedLPAQData
 * @param {{appeal: MappedInstructions}} mappedAppealDetails
 * @returns {PageComponent[]}
 */
export const generateSharedS78S20LpaQuestionnaireComponents = (
	mappedLPAQData,
	mappedAppealDetails
) => {
	/** @type {PageComponent[]} */
	const pageComponents = [];

	const scheduleItem =
		mappedLPAQData.lpaq?.eiaEnvironmentalImpactSchedule?.display?.summaryListItem;
	const scheduleText = scheduleItem?.value?.text || scheduleItem?.value?.html || '';

	const isSchedule2 = scheduleText.toLowerCase().includes('schedule 2');

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
					text: '2. Environmental impact assessment'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.eiaEnvironmentalImpactSchedule?.display.summaryListItem,
				isSchedule2
					? mappedLPAQData.lpaq?.eiaColumnTwoThreshold?.display.summaryListItem
					: undefined,
				mappedLPAQData.lpaq?.eiaRequiresEnvironmentalStatement?.display.summaryListItem,
				mappedLPAQData.lpaq?.eiaEnvironmentalStatement?.display.summaryListItem,
				mappedLPAQData.lpaq?.eiaScreeningOpinion?.display.summaryListItem,
				mappedLPAQData.lpaq?.eiaScreeningDirection?.display.summaryListItem,
				mappedLPAQData.lpaq?.eiaScopingOpinion?.display.summaryListItem,
				isSchedule2
					? mappedLPAQData.lpaq?.eiaDevelopmentDescription?.display.summaryListItem
					: undefined,
				isSchedule2
					? mappedLPAQData.lpaq?.eiaSensitiveAreaDetails?.display.summaryListItem
					: undefined
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
					text: '3. Notifying relevant parties'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.notifyingParties?.display.summaryListItem,
				mappedLPAQData.lpaq?.notificationMethods?.display.summaryListItem,
				mappedLPAQData.lpaq?.siteNotice?.display.summaryListItem,
				mappedLPAQData.lpaq?.lettersToNeighbours?.display.summaryListItem,
				mappedLPAQData.lpaq?.pressAdvert?.display.summaryListItem,
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
					text: '4. Consultation responses and representations'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.representations?.display.summaryListItem,
				mappedLPAQData.lpaq?.consultationResponses?.display.summaryListItem,
				mappedLPAQData.lpaq?.consultedBodiesDetails?.display.summaryListItem
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
					text: '5. Planning officer’s report and supplementary documents'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.officersReport?.display.summaryListItem,
				mappedLPAQData.lpaq?.developmentPlanPolicies?.display.summaryListItem,
				mappedLPAQData.lpaq?.supplementaryPlanning?.display.summaryListItem,
				mappedLPAQData.lpaq?.emergingPlan?.display.summaryListItem,
				mappedLPAQData.lpaq?.otherRelevantPolicies?.display.summaryListItem,
				mappedLPAQData.lpaq?.hasCommunityInfrastructureLevy?.display.summaryListItem,
				mappedLPAQData.lpaq?.communityInfrastructureLevy?.display.summaryListItem,
				mappedLPAQData.lpaq?.isInfrastructureLevyFormallyAdopted?.display.summaryListItem,
				mappedLPAQData.lpaq?.infrastructureLevyAdoptedDate?.display.summaryListItem,
				mappedLPAQData.lpaq?.infrastructureLevyExpectedDate?.display.summaryListItem
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
					text: '6. Site access'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.siteAccess?.display.summaryListItem,
				mappedLPAQData.lpaq?.reasonForNeighbourVisits?.display.summaryListItem,
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
					text: '7. Appeal process'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.procedurePreference?.display.summaryListItem,
				mappedLPAQData.lpaq?.procedurePreferenceDetails?.display.summaryListItem,
				mappedLPAQData.lpaq?.procedurePreferenceDuration?.display.summaryListItem,
				mappedLPAQData.lpaq?.otherAppeals?.display.summaryListItem,
				mappedLPAQData.lpaq?.extraConditions?.display.summaryListItem
			].filter(isDefined)
		}
	});

	return pageComponents;
};
