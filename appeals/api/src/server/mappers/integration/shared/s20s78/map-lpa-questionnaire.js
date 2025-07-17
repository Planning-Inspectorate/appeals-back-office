import { mapDate } from '#utils/mapping/map-dates.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('pins-data-model').Schemas.AppealS78Case} AppealS78Case */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {AppealS78Case}
 */
export const mapLpaQuestionnaireSharedFields = (data) => {
	const { appeal } = data;

	const casedata = appeal.lpaQuestionnaire;

	const designatedSitesNames = [
		...(casedata?.designatedSiteNames ?? []).map((item) => item.designatedSite.key),
		...(casedata?.designatedSiteNameCustom ? [casedata?.designatedSiteNameCustom] : [])
	];

	return {
		extraConditions: casedata?.newConditionDetails ?? null,
		isPublicRightOfWay: casedata?.isPublicRightOfWay ?? null,
		affectsScheduledMonument: casedata?.affectsScheduledMonument ?? null,
		hasProtectedSpecies: casedata?.hasProtectedSpecies ?? null,
		hasTreePreservationOrder: casedata?.hasTreePreservationOrder ?? null,
		hasStatutoryConsultees: casedata?.hasStatutoryConsultees ?? null,
		hasConsultationResponses: casedata?.hasConsultationResponses ?? null,
		hasEmergingPlan: casedata?.hasEmergingPlan ?? null,
		hasSupplementaryPlanningDocs: casedata?.hasSupplementaryPlanningDocs ?? null,
		isAonbNationalLandscape: casedata?.isAonbNationalLandscape ?? null,
		isGypsyOrTravellerSite: casedata?.isGypsyOrTravellerSite ?? null,
		hasInfrastructureLevy: casedata?.hasInfrastructureLevy ?? null,
		isInfrastructureLevyFormallyAdopted: casedata?.isInfrastructureLevyFormallyAdopted ?? null,
		infrastructureLevyAdoptedDate: mapDate(casedata?.infrastructureLevyAdoptedDate),
		infrastructureLevyExpectedDate: mapDate(casedata?.infrastructureLevyExpectedDate),
		// @ts-ignore
		lpaProcedurePreference: casedata?.lpaProcedurePreference ?? null,
		lpaProcedurePreferenceDetails: casedata?.lpaProcedurePreferenceDetails ?? null,
		lpaProcedurePreferenceDuration: casedata?.lpaProcedurePreferenceDuration ?? null,
		reasonForNeighbourVisits: casedata?.reasonForNeighbourVisits ?? null,
		// @ts-ignore
		changedListedBuildingNumbers:
			casedata?.listedBuildingDetails
				?.filter((lp) => !lp.affectsListedBuilding)
				.map((lb) => lb.listEntry) || null,
		designatedSitesNames,
		eiaSensitiveAreaDetails: casedata?.eiaSensitiveAreaDetails ?? null,
		consultedBodiesDetails: casedata?.consultedBodiesDetails ?? null,
		eiaScreeningOpinion: casedata?.eiaScreeningOpinion ?? null,
		eiaScopingOpinion: casedata?.eiaScopingOpinion ?? null,
		eiaColumnTwoThreshold: casedata?.eiaColumnTwoThreshold ?? null,
		eiaRequiresEnvironmentalStatement: casedata?.eiaRequiresEnvironmentalStatement ?? null,
		// @ts-ignore
		eiaEnvironmentalImpactSchedule: casedata?.eiaEnvironmentalImpactSchedule ?? null,
		// @ts-ignore
		eiaDevelopmentDescription: casedata?.eiaDevelopmentDescription ?? null,
		eiaCompletedEnvironmentalStatement: casedata?.eiaCompletedEnvironmentalStatement ?? null,
		importantInformation: casedata?.importantInformation ?? null,
		redeterminedIndicator: casedata?.redeterminedIndicator ?? null,
		dateCostsReportDespatched: mapDate(casedata?.dateCostsReportDespatched),
		dateNotRecoveredOrDerecovered: mapDate(casedata?.dateCostsReportDespatched),
		dateRecovered: mapDate(casedata?.dateRecovered),
		originalCaseDecisionDate: mapDate(casedata?.originalCaseDecisionDate),
		targetDate: mapDate(casedata?.targetDate),
		siteNoticesSentDate: mapDate(casedata?.siteNoticesSentDate),
		siteWithinSSSI: casedata?.siteWithinSSSI ?? null
	};
};
