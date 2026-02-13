import { mapLpaQuestionnaireSharedFields } from '../shared/s20s78/map-lpa-questionnaire.js';

/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealS78Case} AppealS78Case */

/**
 * @param {MappingRequest} data
 * @returns {AppealS78Case}
 */
export const mapLpaQuestionnaire = (data) => {
	const { lpaQuestionnaire } = data.appeal;

	return {
		...mapLpaQuestionnaireSharedFields(data),
		noticeRelatesToBuildingEngineeringMiningOther:
			lpaQuestionnaire?.noticeRelatesToBuildingEngineeringMiningOther ?? null,
		siteAreaSquareMetres: lpaQuestionnaire?.siteAreaSquareMetres
			? Number(lpaQuestionnaire.siteAreaSquareMetres)
			: null,
		areaOfAllegedBreachInSquareMetres: lpaQuestionnaire?.areaOfAllegedBreachInSquareMetres
			? Number(lpaQuestionnaire.areaOfAllegedBreachInSquareMetres)
			: null,
		floorSpaceCreatedByBreachInSquareMetres:
			lpaQuestionnaire?.floorSpaceCreatedByBreachInSquareMetres
				? Number(lpaQuestionnaire.floorSpaceCreatedByBreachInSquareMetres)
				: null,
		changeOfUseRefuseOrWaste: lpaQuestionnaire?.changeOfUseRefuseOrWaste ?? null,
		changeOfUseMineralExtraction: lpaQuestionnaire?.changeOfUseMineralExtraction ?? null,
		changeOfUseMineralStorage: lpaQuestionnaire?.changeOfUseMineralStorage ?? null,
		relatesToErectionOfBuildingOrBuildings:
			lpaQuestionnaire?.relatesToErectionOfBuildingOrBuildings ?? null,
		relatesToBuildingWithAgriculturalPurpose:
			lpaQuestionnaire?.relatesToBuildingWithAgriculturalPurpose ?? null,
		relatesToBuildingSingleDwellingHouse:
			lpaQuestionnaire?.relatesToBuildingSingleDwellingHouse ?? null,
		affectedTrunkRoadName: lpaQuestionnaire?.affectedTrunkRoadName ?? null,
		isSiteOnCrownLand: lpaQuestionnaire?.isSiteOnCrownLand ?? null,
		article4AffectedDevelopmentRights: lpaQuestionnaire?.article4AffectedDevelopmentRights ?? null
	};
};
