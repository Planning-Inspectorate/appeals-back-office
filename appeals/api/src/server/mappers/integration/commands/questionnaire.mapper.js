/** @typedef {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('@pins/appeals.api').Schema.DesignatedSite} DesignatedSite */

import { isEnforcementCaseType } from '@pins/appeals/utils/appeal-type-checks.js';
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
	const isEnforcement = isEnforcementCaseType(casedata.caseType);

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
				...generateS78SchemaFields(casedata, designatedSites),
				...generateEnforcementCommonSchemaFields(casedata),
				...generateEnforcementSpecificSchemaFields(casedata)
				//@ts-ignore
			};
		case APPEAL_CASE_TYPE.F: // ENFORCEMENT LISTED BUILDING
			return {
				...generateCommonSchemaFields(casedata),
				...generateHasSchemaFields(casedata, listedBuildingsData),
				//@ts-ignore
				...generateS78SchemaFields(casedata, designatedSites),
				...generateEnforcementCommonSchemaFields(casedata),
				preserveGrantLoan: casedata.preserveGrantLoan,
				historicEnglandConsultation: casedata.consultHistoricEngland
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
		lpaQuestionnaireSubmittedDate: casedata.lpaQuestionnaireSubmittedDate,
		siteAccessDetails,
		siteSafetyDetails,
		reasonForNeighbourVisits: casedata.reasonForNeighbourVisits
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
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand} casedata
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
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand} casedata
 * @param {DesignatedSite[]} designatedSites
 * @returns
 */
const generateCasAdvertSchemaFields = (casedata, designatedSites) => {
	return {
		affectsScheduledMonument: casedata.affectsScheduledMonument,
		isAonbNationalLandscape: casedata.isAonbNationalLandscape,
		// @ts-ignore - values defined before type narrowing
		...mapDesignatedSiteNames(casedata, designatedSites),
		consultedBodiesDetails: casedata.consultedBodiesDetails,
		hasProtectedSpecies: casedata.hasProtectedSpecies,
		hasStatutoryConsultees: casedata.hasStatutoryConsultees,
		hasEmergingPlan: casedata.hasEmergingPlan,
		lpaProcedurePreference: casedata.lpaProcedurePreference,
		lpaProcedurePreferenceDetails: casedata.lpaProcedurePreferenceDetails,
		lpaProcedurePreferenceDuration: casedata.lpaProcedurePreferenceDuration,
		isSiteInAreaOfSpecialControlAdverts: casedata.isSiteInAreaOfSpecialControlAdverts,
		wasApplicationRefusedDueToHighwayOrTraffic: casedata.wasApplicationRefusedDueToHighwayOrTraffic,
		didAppellantSubmitCompletePhotosAndPlans: casedata.didAppellantSubmitCompletePhotosAndPlans
	};
};

/**
 * Common Enforcement properties shared between standard Enforcement (C) and ELB (F)
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQEnforcementCommonSubmissionProperties} casedata
 * @returns
 */
const generateEnforcementCommonSchemaFields = (casedata) => {
	return {
		noticeRelatesToBuildingEngineeringMiningOther:
			casedata.noticeRelatesToBuildingEngineeringMiningOther,
		siteAreaSquareMetres: casedata.siteAreaSquareMetres,
		areaOfAllegedBreachInSquareMetres: casedata.areaOfAllegedBreachInSquareMetres,
		floorSpaceCreatedByBreachInSquareMetres: casedata.floorSpaceCreatedByBreachInSquareMetres,
		relatesToErectionOfBuildingOrBuildings: casedata.relatesToErectionOfBuildingOrBuildings,
		relatesToBuildingWithAgriculturalPurpose: casedata.relatesToBuildingWithAgriculturalPurpose,
		relatesToBuildingSingleDwellingHouse: casedata.relatesToBuildingSingleDwellingHouse
	};
};

/**
 * Properties specific to standard Enforcement (C)
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQEnforcementSubmissionProperties} casedata
 * @returns
 */
const generateEnforcementSpecificSchemaFields = (casedata) => {
	return {
		affectedTrunkRoadName: casedata.affectedTrunkRoadName,
		isSiteOnCrownLand: casedata.isSiteOnCrownLand,
		article4AffectedDevelopmentRights: casedata.article4AffectedDevelopmentRights,
		changeOfUseRefuseOrWaste: casedata.changeOfUseRefuseOrWaste,
		changeOfUseMineralExtraction: casedata.changeOfUseMineralExtraction,
		changeOfUseMineralStorage: casedata.changeOfUseMineralStorage
	};
};

/**
 *
 * @param {import('@planning-inspectorate/data-model').Schemas.LPAQLDCSubmissionProperties} casedata
 * @returns
 */
const generateLDCSchemaFields = (casedata) => {
	return {
		appealUnderActSection: casedata.appealUnderActSection,
		lpaConsiderAppealInvalid: casedata.lpaConsiderAppealInvalid,
		lpaAppealInvalidReasons: casedata.lpaAppealInvalidReasons
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
