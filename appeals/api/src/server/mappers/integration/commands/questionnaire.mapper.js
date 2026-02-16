/** @typedef {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('@pins/appeals.api').Schema.DesignatedSite} DesignatedSite */

import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

/**
 *
 * @param {Pick<LPAQuestionnaireCommand, 'casedata'>} command
 * @param {DesignatedSite[]} designatedSites
 * @returns {Omit<import('#db-client/models.ts').LPAQuestionnaireCreateInput, 'appeal'>}
 */
export const mapQuestionnaireIn = (command, designatedSites) => {
	const casedata = command.casedata;

	const isS20 = casedata.caseType === APPEAL_CASE_TYPE.Y;
	const isS78 = casedata.caseType === APPEAL_CASE_TYPE.W;
	const isAdverts = casedata.caseType === APPEAL_CASE_TYPE.H;
	const isLDC = casedata.caseType === APPEAL_CASE_TYPE.X;
	const isEnforcement = casedata.caseType === APPEAL_CASE_TYPE.C;

	//@ts-ignore
	const listedBuildingsData = mapListedBuildings(
		// @ts-ignore
		casedata,
		isS78 || isS20 || isAdverts || isLDC || isEnforcement
	);

	switch (casedata.caseType) {
		case APPEAL_CASE_TYPE.D: // HAS - schema includes common and has fields
		case APPEAL_CASE_TYPE.ZP: // CAS_PLANNING - schema includes common and has fields
			return {
				...generateCommonSchemaFields(casedata),
				...generateHasSchemaFields(casedata, listedBuildingsData)
			};

		case APPEAL_CASE_TYPE.W: // S78 - schema includes common, has and s78 fields
			return {
				...generateCommonSchemaFields(casedata),
				...generateHasSchemaFields(casedata, listedBuildingsData),
				//@ts-ignore
				...generateS78SchemaFields(casedata, designatedSites)
			};
		case APPEAL_CASE_TYPE.Y: // S20 - schema includes common, has and s78 fields
			return {
				...generateCommonSchemaFields(casedata),
				...generateHasSchemaFields(casedata, listedBuildingsData),
				//@ts-ignore
				...generateS78SchemaFields(casedata, designatedSites),
				preserveGrantLoan: casedata.preserveGrantLoan,
				historicEnglandConsultation: casedata.consultHistoricEngland
			};
		case APPEAL_CASE_TYPE.H: // ADVERTISEMENT - schema includes cas adverts + changed listed buildings
		case APPEAL_CASE_TYPE.ZA: // CAS_ADVERTISEMENT - schema includes common, has and adverts fields
			return {
				...generateCommonSchemaFields(casedata),
				...generateHasSchemaFields(casedata, listedBuildingsData),
				//@ts-ignore
				...generateCasAdvertSchemaFields(casedata, designatedSites)
			};
		case APPEAL_CASE_TYPE.C: // ENFORCEMENT
			return {
				...generateCommonSchemaFields(casedata),
				...generateHasSchemaFields(casedata, listedBuildingsData),
				//@ts-ignore
				...generateS78SchemaFields(casedata, designatedSites, ['hasEmergingPlan']),
				...generateEnforcementSchemaFields(casedata),
				eiaScopingOpinion: null
				//@ts-ignore
			};
		case APPEAL_CASE_TYPE.X: // LDC - schema includes common, HAS, S78 and LDC fields
			return {
				...generateCommonSchemaFields(casedata),
				...generateHasSchemaFields(casedata, listedBuildingsData),
				//@ts-ignore
				...generateS78SchemaFields(casedata, designatedSites),
				...generateLDCSchemaFields(casedata)
				//@ts-ignore
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
		lpaQuestionnaireSubmittedDate: casedata.lpaQuestionnaireSubmittedDate ?? null,
		siteAccessDetails,
		siteSafetyDetails,
		reasonForNeighbourVisits: casedata.reasonForNeighbourVisits ?? null
	};
};

/**
 * @typedef {import('@planning-inspectorate/data-model').Schemas.LPAQHASSubmissionProperties
 *   & import('@planning-inspectorate/data-model').Schemas.LPAQCommonSubmissionProperties
 * } LPAQSubmissionCaseData
 */

/**
 *
 * @param {LPAQSubmissionCaseData} casedata
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
		lpaStatement: casedata.lpaStatement ?? null,
		isCorrectAppealType: casedata.isCorrectAppealType ?? null,
		isGreenBelt: casedata.isGreenBelt ?? null,
		inConservationArea: casedata.inConservationArea ?? null,
		newConditionDetails: casedata.newConditionDetails ?? null,
		lpaCostsAppliedFor: casedata.lpaCostsAppliedFor ?? null,
		...(listedBuildingsData && {
			listedBuildingDetails: {
				create: listedBuildingsData
			}
		}),
		lpaNotificationMethods
	};
};

/**
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand} casedata
 * @param {DesignatedSite[]} designatedSites
 * @param {string[]} [fieldsToExclude=[]]
 * @returns
 */
const generateS78SchemaFields = (casedata, designatedSites, fieldsToExclude = []) => {
	const fields = {
		affectsScheduledMonument: casedata.affectsScheduledMonument ?? null,
		isAonbNationalLandscape: casedata.isAonbNationalLandscape ?? null,
		isGypsyOrTravellerSite: casedata.isGypsyOrTravellerSite ?? null,
		isPublicRightOfWay: casedata.isPublicRightOfWay ?? null,
		// @ts-ignore - values defined before type narrowing
		...mapDesignatedSiteNames(casedata, designatedSites),
		eiaEnvironmentalImpactSchedule: casedata.eiaEnvironmentalImpactSchedule ?? null,
		eiaDevelopmentDescription: casedata.eiaDevelopmentDescription ?? null,
		eiaSensitiveAreaDetails: casedata.eiaSensitiveAreaDetails ?? null,
		eiaColumnTwoThreshold: casedata.eiaColumnTwoThreshold ?? null,
		eiaScreeningOpinion: casedata.eiaScreeningOpinion ?? null,
		eiaScopingOpinion: casedata.eiaScopingOpinion ?? null,
		eiaRequiresEnvironmentalStatement: casedata.eiaRequiresEnvironmentalStatement ?? null,
		eiaCompletedEnvironmentalStatement: casedata.eiaCompletedEnvironmentalStatement ?? null,
		consultedBodiesDetails: casedata.consultedBodiesDetails ?? null,
		hasProtectedSpecies: casedata.hasProtectedSpecies ?? null,
		hasTreePreservationOrder: casedata.hasTreePreservationOrder ?? null,
		hasStatutoryConsultees: casedata.hasStatutoryConsultees ?? null,
		hasConsultationResponses: casedata.hasConsultationResponses ?? null,
		hasEmergingPlan: casedata.hasEmergingPlan ?? null,
		hasSupplementaryPlanningDocs: casedata.hasSupplementaryPlanningDocs ?? null,
		hasInfrastructureLevy: casedata.hasInfrastructureLevy ?? null,
		isInfrastructureLevyFormallyAdopted: casedata.isInfrastructureLevyFormallyAdopted ?? null,
		infrastructureLevyAdoptedDate: casedata.infrastructureLevyAdoptedDate ?? null,
		infrastructureLevyExpectedDate: casedata.infrastructureLevyExpectedDate ?? null,
		lpaProcedurePreference: casedata.lpaProcedurePreference ?? null,
		lpaProcedurePreferenceDetails: casedata.lpaProcedurePreferenceDetails ?? null,
		lpaProcedurePreferenceDuration: casedata.lpaProcedurePreferenceDuration ?? null
	};
	fieldsToExclude.forEach((key) => {
		if (key in fields) {
			fields[key] = null;
		}
	});

	return fields;
};

/**
 *
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand} casedata
 * @param {DesignatedSite[]} designatedSites
 * @returns
 */
const generateCasAdvertSchemaFields = (casedata, designatedSites) => {
	return {
		affectsScheduledMonument: casedata.affectsScheduledMonument ?? null,
		isAonbNationalLandscape: casedata.isAonbNationalLandscape ?? null,
		// @ts-ignore - values defined before type narrowing
		...mapDesignatedSiteNames(casedata, designatedSites),
		consultedBodiesDetails: casedata.consultedBodiesDetails ?? null,
		hasProtectedSpecies: casedata.hasProtectedSpecies ?? null,
		hasStatutoryConsultees: casedata.hasStatutoryConsultees ?? null,
		hasEmergingPlan: casedata.hasEmergingPlan ?? null,
		lpaProcedurePreference: casedata.lpaProcedurePreference ?? null,
		lpaProcedurePreferenceDetails: casedata.lpaProcedurePreferenceDetails ?? null,
		lpaProcedurePreferenceDuration: casedata.lpaProcedurePreferenceDuration ?? null,
		isSiteInAreaOfSpecialControlAdverts: casedata.isSiteInAreaOfSpecialControlAdverts ?? null,
		wasApplicationRefusedDueToHighwayOrTraffic:
			casedata.wasApplicationRefusedDueToHighwayOrTraffic ?? null,
		didAppellantSubmitCompletePhotosAndPlans:
			casedata.didAppellantSubmitCompletePhotosAndPlans ?? null
	};
};

/**
 *
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQEnforcementSubmissionProperties} casedata
 * @returns
 */
const generateEnforcementSchemaFields = (casedata) => {
	return {
		// Add enforcement specific fields here when they are defined
		noticeRelatesToBuildingEngineeringMiningOther:
			casedata.noticeRelatesToBuildingEngineeringMiningOther ?? null,
		siteAreaSquareMetres: casedata.siteAreaSquareMetres ?? null,
		hasAllegedBreachArea: casedata.hasAllegedBreachArea ?? null,
		doesAllegedBreachCreateFloorSpace: casedata.doesAllegedBreachCreateFloorSpace ?? null,
		changeOfUseRefuseOrWaste: casedata.changeOfUseRefuseOrWaste ?? null,
		changeOfUseMineralExtraction: casedata.changeOfUseMineralExtraction ?? null,
		changeOfUseMineralStorage: casedata.changeOfUseMineralStorage ?? null,
		relatesToErectionOfBuildingOrBuildings: casedata.relatesToErectionOfBuildingOrBuildings ?? null,
		relatesToBuildingWithAgriculturalPurpose:
			casedata.relatesToBuildingWithAgriculturalPurpose ?? null,
		relatesToBuildingSingleDwellingHouse: casedata.relatesToBuildingSingleDwellingHouse ?? null,
		affectedTrunkRoadName: casedata.affectedTrunkRoadName ?? null,
		isSiteOnCrownLand: casedata.isSiteOnCrownLand ?? null,
		article4AffectedDevelopmentRights: casedata.article4AffectedDevelopmentRights ?? null
	};
};

/**
 *
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQLDCSubmissionProperties} casedata
 * @returns
 */
const generateLDCSchemaFields = (casedata) => {
	return {
		appealUnderActSection: casedata.appealUnderActSection ?? null,
		lpaConsiderAppealInvalid: casedata.lpaConsiderAppealInvalid ?? null,
		lpaAppealInvalidReasons: casedata.lpaAppealInvalidReasons ?? null
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
		? // @ts-ignore
			(casedata.changedListedBuildingNumbers || []).map((/** @type {string} */ entry) => {
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
	// @ts-ignore
	if (casedata.designatedSitesNames && casedata.designatedSitesNames.length > 0) {
		const defaultSiteNames = designatedSites.map((site) => site.key);

		// @ts-ignore
		const siteNames = casedata.designatedSitesNames.filter((/** @type {string} */ site) =>
			defaultSiteNames.includes(site)
		);

		// @ts-ignore
		const customSiteName = casedata.designatedSitesNames.find(
			(/** @type {string} */ site) => !defaultSiteNames.includes(site)
		);

		return {
			designatedSiteNames: {
				create: siteNames.map((/** @type {string} */ site) => {
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
