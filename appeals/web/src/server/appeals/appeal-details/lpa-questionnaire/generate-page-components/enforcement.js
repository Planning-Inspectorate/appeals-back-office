import { isDefined } from '#lib/ts-utilities.js';
import { generateSharedS78S20LpaQuestionnaireComponents } from './shared-s78-s20.js';

/**
 * @param {{lpaq: MappedInstructions}} mappedLPAQData
 * @param {{appeal: MappedInstructions}} mappedAppealDetails
 * @returns {PageComponent[]}
 */
export const generateEnforcementLpaQuestionnaireComponents = (
	mappedLPAQData,
	mappedAppealDetails
) => {
	/** @type {PageComponent[]} */
	const pageComponents = [];

	const wrapperHtml = {
		opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
		closing: '</div></div>'
	};

	// SECTION 1: Constraints, designations and other issues
	pageComponents.push({
		type: 'summary-list',
		wrapperHtml,
		parameters: {
			attributes: { id: 'constraints-summary' },
			card: { title: { text: '1. Constraints, designations and other issues' } },
			rows: [
				// 1. Replicated S78 flow starts
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
				mappedLPAQData.lpaq?.definitiveMapStatement?.display.summaryListItem,

				// 2. Enforcement Specific Questions
				mappedLPAQData.lpaq?.noticeRelatesToOperations?.display.summaryListItem,
				mappedLPAQData.lpaq?.siteAreaSquareMetres?.display.summaryListItem,
				mappedLPAQData.lpaq?.hasAllegedBreachArea?.display.summaryListItem,
				mappedLPAQData.lpaq?.allegedBreachCreatesFloorSpace?.display.summaryListItem,
				mappedLPAQData.lpaq?.changeOfUseRefuseOrWaste?.display.summaryListItem,
				mappedLPAQData.lpaq?.changeOfUseMineralExtraction?.display.summaryListItem,
				mappedLPAQData.lpaq?.changeOfUseMineralStorage?.display.summaryListItem,
				mappedLPAQData.lpaq?.relatesToErectionOfBuildings?.display.summaryListItem,
				mappedLPAQData.lpaq?.relatesToAgriculturalPurpose?.display.summaryListItem,
				mappedLPAQData.lpaq?.relatesToSingleDwellingHouse?.display.summaryListItem,
				mappedLPAQData.lpaq?.withinTrunkRoadDistance?.display.summaryListItem,
				mappedLPAQData.lpaq?.isSiteOnCrownLand?.display.summaryListItem,
				mappedLPAQData.lpaq?.stopNotice?.display.summaryListItem,
				mappedLPAQData.lpaq?.article4Direction?.display.summaryListItem,
				mappedLPAQData.lpaq?.removedPermittedDevelopmentRights?.display.summaryListItem
			].filter(isDefined)
		}
	});

	// SECTION 2: Environmental Impact Assessment
	const sharedComponents = generateSharedS78S20LpaQuestionnaireComponents(
		mappedLPAQData,
		mappedAppealDetails
	);
	pageComponents.push(sharedComponents[0]);

	// SECTION 3: Notifying relevant parties
	pageComponents.push({
		type: 'summary-list',
		wrapperHtml,
		parameters: {
			attributes: { id: 'notifications-summary' },
			card: { title: { text: '3. Notifying relevant parties' } },
			rows: [
				mappedLPAQData.lpaq?.appealNotification?.display.summaryListItem,
				mappedLPAQData.lpaq?.enforcementList?.display.summaryListItem
			].filter(isDefined)
		}
	});

	// SECTION 4: Planning officer’s report and supporting documents
	pageComponents.push({
		type: 'summary-list',
		wrapperHtml,
		parameters: {
			attributes: { id: 'officers-report-summary' },
			card: { title: { text: '4. Planning officer’s report and supporting documents' } },
			rows: [
				mappedLPAQData.lpaq?.officersReport?.display.summaryListItem,
				mappedLPAQData.lpaq?.developmentPlanPolicies?.display.summaryListItem,
				mappedLPAQData.lpaq?.supplementaryPlanning?.display.summaryListItem,
				mappedLPAQData.lpaq?.otherRelevantPolicies?.display.summaryListItem,
				mappedLPAQData.lpaq?.hasCommunityInfrastructureLevy?.display.summaryListItem,
				mappedLPAQData.lpaq?.communityInfrastructureLevy?.display.summaryListItem,
				mappedLPAQData.lpaq?.isInfrastructureLevyFormallyAdopted?.display.summaryListItem,
				mappedLPAQData.lpaq?.infrastructureLevyAdoptedDate?.display.summaryListItem,
				mappedLPAQData.lpaq?.infrastructureLevyExpectedDate?.display.summaryListItem,
				mappedLPAQData.lpaq?.localDevelopmentOrder?.display.summaryListItem,
				mappedLPAQData.lpaq?.planningPermission?.display.summaryListItem,
				mappedLPAQData.lpaq?.lpaEnforcementNotice?.display.summaryListItem,
				mappedLPAQData.lpaq?.lpaEnforcementNoticePlan?.display.summaryListItem,
				mappedLPAQData.lpaq?.planningContraventionNotice?.display.summaryListItem
			].filter(isDefined)
		}
	});

	// SECTION 5: Site access
	pageComponents.push({
		type: 'summary-list',
		wrapperHtml,
		parameters: {
			attributes: { id: 'site-access-summary' },
			card: { title: { text: '5. Site access' } },
			rows: [
				mappedLPAQData.lpaq?.siteAccess?.display.summaryListItem,
				mappedLPAQData.lpaq?.reasonForNeighbourVisits?.display.summaryListItem,
				mappedAppealDetails.appeal.lpaNeighbouringSites?.display.summaryListItem,
				mappedLPAQData.lpaq?.lpaHealthAndSafety?.display.summaryListItem
			].filter(isDefined)
		}
	});

	// SECTION 6: Appeal Process
	pageComponents.push({
		type: 'summary-list',
		wrapperHtml,
		parameters: {
			attributes: { id: 'appeal-process-summary' },
			card: { title: { text: '6. Appeal process' } },
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
