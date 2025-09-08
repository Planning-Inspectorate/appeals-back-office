/** @typedef {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('@pins/appeals.api').Schema.DesignatedSite} DesignatedSite */

/**
 *
 * @param {Pick<LPAQuestionnaireCommand, 'casedata'>} command
 * @param {DesignatedSite[]} designatedSites
 * @returns {Omit<import('#db-client').Prisma.LPAQuestionnaireCreateInput, 'appeal'>}
 */
export const mapQuestionnaireIn = (command, designatedSites) => {
	const casedata = command.casedata;

	const isS20 = casedata.caseType === 'Y';
	const isS78 = casedata.caseType === 'W';

	//@ts-ignore
	const listedBuildingsData = mapListedBuildings(casedata, isS78 || isS20);

	switch (casedata.caseType) {
		case 'D': // HAS - schema includes common and has fields
		case 'ZP': // CAS_PLANNING - schema includes common and has fields
			//@ts-ignore - values defined before type narrowing
			return {
				...generateCommonSchemaFields(casedata),
				...generateHasSchemaFields(casedata, listedBuildingsData)
			};

		case 'W': // S78 - schema includes common, has and s78 fields
			return {
				...generateCommonSchemaFields(casedata),
				...generateHasSchemaFields(casedata, listedBuildingsData),
				...generateS78SchemaFields(casedata, designatedSites)
			};
		case 'Y': // S20 - schema includes common, has and s78 fields
			return {
				...generateCommonSchemaFields(casedata),
				...generateHasSchemaFields(casedata, listedBuildingsData),
				...generateS78SchemaFields(casedata, designatedSites),
				preserveGrantLoan: casedata.preserveGrantLoan,
				historicEnglandConsultation: casedata.consultHistoricEngland
			};

		default:
			throw new Error(`Unsupported case type '${casedata.caseType}'`);
	}
};

/**
 *
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQCommonSubmissionProperties} casedata
 * @returns
 */
const generateCommonSchemaFields = (casedata) => {
	const siteAccessDetails =
		casedata.siteAccessDetails != null && casedata.siteAccessDetails.length > 0
			? casedata.siteAccessDetails[0]
			: null;

	const siteSafetyDetails =
		casedata.siteSafetyDetails != null && casedata.siteSafetyDetails.length > 0
			? casedata.siteSafetyDetails[0]
			: null;

	return {
		lpaQuestionnaireSubmittedDate: casedata.lpaQuestionnaireSubmittedDate,
		siteAccessDetails,
		siteSafetyDetails,
		reasonForNeighbourVisits: casedata.reasonForNeighbourVisits
	};
};

/**
 *
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQHASSubmissionProperties} casedata
 * @param {{listEntry: string, affectsListedBuilding: boolean }[] | null} listedBuildingsData
 * @returns
 */
const generateHasSchemaFields = (casedata, listedBuildingsData) => {
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

	return {
		lpaStatement: casedata.lpaStatement,
		isCorrectAppealType: casedata.isCorrectAppealType,
		isGreenBelt: casedata.isGreenBelt,
		inConservationArea: casedata.inConservationArea,
		newConditionDetails: casedata.newConditionDetails,
		lpaCostsAppliedFor: casedata.lpaCostsAppliedFor,
		...(listedBuildingsData && {
			listedBuildingDetails: {
				create: listedBuildingsData
			}
		}),
		lpaNotificationMethods
	};
};

/**
 *
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQS78SubmissionProperties} casedata
 * @param {DesignatedSite[]} designatedSites
 * @returns
 */
const generateS78SchemaFields = (casedata, designatedSites) => {
	return {
		affectsScheduledMonument: casedata.affectsScheduledMonument,
		isAonbNationalLandscape: casedata.isAonbNationalLandscape,
		isGypsyOrTravellerSite: casedata.isGypsyOrTravellerSite,
		isPublicRightOfWay: casedata.isPublicRightOfWay,
		// @ts-ignore - values defined before type narrowing
		...mapDesignatedSiteNames(casedata, designatedSites),
		eiaEnvironmentalImpactSchedule: casedata.eiaEnvironmentalImpactSchedule,
		eiaDevelopmentDescription: casedata.eiaDevelopmentDescription,
		eiaSensitiveAreaDetails: casedata.eiaSensitiveAreaDetails,
		eiaColumnTwoThreshold: casedata.eiaColumnTwoThreshold,
		eiaScreeningOpinion: casedata.eiaScreeningOpinion,
		eiaRequiresEnvironmentalStatement: casedata.eiaRequiresEnvironmentalStatement,
		eiaCompletedEnvironmentalStatement: casedata.eiaCompletedEnvironmentalStatement,
		consultedBodiesDetails: casedata.consultedBodiesDetails,
		hasProtectedSpecies: casedata.hasProtectedSpecies,
		hasTreePreservationOrder: casedata.hasTreePreservationOrder,
		hasStatutoryConsultees: casedata.hasStatutoryConsultees,
		hasConsultationResponses: casedata.hasConsultationResponses,
		hasEmergingPlan: casedata.hasEmergingPlan,
		hasSupplementaryPlanningDocs: casedata.hasSupplementaryPlanningDocs,
		hasInfrastructureLevy: casedata.hasInfrastructureLevy,
		isInfrastructureLevyFormallyAdopted: casedata.isInfrastructureLevyFormallyAdopted,
		infrastructureLevyAdoptedDate: casedata.infrastructureLevyAdoptedDate,
		infrastructureLevyExpectedDate: casedata.infrastructureLevyExpectedDate,
		lpaProcedurePreference: casedata.lpaProcedurePreference,
		lpaProcedurePreferenceDetails: casedata.lpaProcedurePreferenceDetails,
		lpaProcedurePreferenceDuration: casedata.lpaProcedurePreferenceDuration
	};
};

/**
 *
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQS78SubmissionProperties & import('@planning-inspectorate/data-model').Schemas.LPAQHASSubmissionProperties } casedata
 * @param {boolean} appealHasChangedListedBuilding
 * @returns {{listEntry: string, affectsListedBuilding: boolean }[] | null}
 */
const mapListedBuildings = (casedata, appealHasChangedListedBuilding) => {
	const affectedListedBuildings =
		casedata.affectedListedBuildingNumbers?.map((entry) => {
			return {
				listEntry: entry,
				affectsListedBuilding: true
			};
		}) ?? [];

	const changedListedBuildings = appealHasChangedListedBuilding
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
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQS78SubmissionProperties} casedata
 * @param {DesignatedSite[]} designatedSites
 * @returns {*|undefined}
 */
export const mapDesignatedSiteNames = (casedata, designatedSites) => {
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
