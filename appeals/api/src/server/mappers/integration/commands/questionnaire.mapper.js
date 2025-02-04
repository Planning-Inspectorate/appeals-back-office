/** @typedef {import('pins-data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('@pins/appeals.api').Schema.DesignatedSite} DesignatedSite */

/**
 *
 * @param {Pick<LPAQuestionnaireCommand, 'casedata'>} command
 * @param {boolean} isS78
 * @param {DesignatedSite[]} designatedSites
 * @returns {Omit<import('#db-client').Prisma.LPAQuestionnaireCreateInput, 'appeal'>}
 */
export const mapQuestionnaireIn = (command, isS78, designatedSites) => {
	const casedata = command.casedata;
	const siteAccessDetails =
		casedata.siteAccessDetails != null && casedata.siteAccessDetails.length > 0
			? casedata.siteAccessDetails[0]
			: null;

	const siteSafetyDetails =
		casedata.siteSafetyDetails != null && casedata.siteSafetyDetails.length > 0
			? casedata.siteSafetyDetails[0]
			: null;

	const lpaNotificationMethods =
		casedata.notificationMethod != null && casedata.notificationMethod.length > 0
			? {
					create: casedata.notificationMethod.map((method) => {
						return {
							lpaNotificationMethod: {
								connect: {
									key: method
								}
							}
						};
					})
			  }
			: undefined;

	const listedBuildingsData = mapListedBuildings(casedata, isS78);

	return {
		lpaQuestionnaireSubmittedDate: casedata.lpaQuestionnaireSubmittedDate,
		lpaStatement: casedata.lpaStatement,
		isCorrectAppealType: casedata.isCorrectAppealType,
		isGreenBelt: casedata.isGreenBelt,
		inConservationArea: casedata.inConservationArea,
		newConditionDetails: casedata.newConditionDetails,
		lpaCostsAppliedFor: casedata.lpaCostsAppliedFor,
		siteAccessDetails,
		siteSafetyDetails,
		lpaNotificationMethods,
		...(listedBuildingsData && {
			listedBuildingDetails: {
				create: listedBuildingsData
			}
		}),
		...(isS78 && {
			lpaStatement: casedata.lpaStatement,
			affectsScheduledMonument: casedata.affectsScheduledMonument,
			isAonbNationalLandscape: casedata.isAonbNationalLandscape,
			hasTreePreservationOrder: casedata.hasTreePreservationOrder,
			isGypsyOrTravellerSite: casedata.isGypsyOrTravellerSite,
			isPublicRightOfWay: casedata.isPublicRightOfWay,
			...mapDesignatedSiteNames(casedata, designatedSites),
			eiaEnvironmentalImpactSchedule: casedata.eiaEnvironmentalImpactSchedule,
			eiaDevelopmentDescription: casedata.eiaDevelopmentDescription,
			eiaSensitiveAreaDetails: casedata.eiaSensitiveAreaDetails,
			eiaColumnTwoThreshold: casedata.eiaColumnTwoThreshold,
			eiaScreeningOpinion: casedata.eiaScreeningOpinion,
			eiaRequiresEnvironmentalStatement: casedata.eiaRequiresEnvironmentalStatement,
			eiaCompletedEnvironmentalStatement: casedata.eiaCompletedEnvironmentalStatement,
			eiaConsultedBodiesDetails: casedata.eiaConsultedBodiesDetails,
			hasStatutoryConsultees: casedata.hasStatutoryConsultees,
			hasConsultationResponses: casedata.hasConsultationResponses,
			hasEmergingPlan: casedata.hasEmergingPlan,
			hasSupplementaryPlanningDocs: casedata.hasSupplementaryPlanningDocs,
			hasInfrastructureLevy: casedata.hasInfrastructureLevy,
			isInfrastructureLevyFormallyAdopted: casedata.isInfrastructureLevyFormallyAdopted,
			infrastructureLevyAdoptedDate: casedata.infrastructureLevyAdoptedDate,
			lpaProcedurePreference: casedata.lpaProcedurePreference,
			lpaProcedurePreferenceDetails: casedata.lpaProcedurePreferenceDetails,
			lpaProcedurePreferenceDuration: casedata.lpaProcedurePreferenceDuration
		})
	};
};

/**
 *
 * @param {import('pins-data-model').Schemas.LPAQS78SubmissionProperties} casedata
 * @param {boolean} isS78
 * @returns {{listEntry: string, affectsListedBuilding: boolean }[] | null}
 */
const mapListedBuildings = (casedata, isS78) => {
	const affectedListedBuildings =
		casedata.affectedListedBuildingNumbers?.map((entry) => {
			return {
				listEntry: entry,
				affectsListedBuilding: true
			};
		}) ?? [];

	const changedListedBuildings = isS78
		? (casedata.changedListedBuildingNumbers || []).map((entry) => {
				return {
					listEntry: entry,
					affectsListedBuilding: false
				};
		  })
		: [];

	const combinedListedBuildings = [...affectedListedBuildings, ...changedListedBuildings];

	return combinedListedBuildings.length > 0 ? combinedListedBuildings : null;
};

/**
 *
 * @param {import('pins-data-model').Schemas.LPAQS78SubmissionProperties} casedata
 * @param {DesignatedSite[]} designatedSites
 * @returns {*|undefined}
 */
const mapDesignatedSiteNames = (casedata, designatedSites) => {
	if (casedata.designatedSitesNames && casedata.designatedSitesNames.length > 0) {
		const defaultSiteNames = designatedSites.map((site) => site.key);

		const siteNames = casedata.designatedSitesNames.filter((site) =>
			defaultSiteNames.includes(site)
		);

		const customSiteName = casedata.designatedSitesNames.find(
			(/** @type {string} */ site) => !defaultSiteNames.includes(site)
		);

		return {
			designatedSiteNames: {
				create: siteNames.map((site) => {
					return {
						designatedSite: {
							connect: { key: site }
						}
					};
				})
			},
			designatedSiteNameCustom: customSiteName
		};
	}
};
