/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.LpaQuestionnaire} LpaQuestionnaire */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { mapS78LpaQuestionnaire } from '../s78/map-lpa-questionnaire.js';

/**
 * @param {MappingRequest} data
 * @returns {LpaQuestionnaire|undefined}
 */
export const mapEnforcementLpaQuestionnaire = (data) => {
	const {
		appeal: { lpaQuestionnaire }
	} = data;

	const s78Mapper = mapS78LpaQuestionnaire(data);

	// eslint-disable-next-line no-unused-vars
	const { consultedBodiesDetails: _unused, ...sharedS78Mappers } = s78Mapper ?? {};

	if (lpaQuestionnaire) {
		return {
			...sharedS78Mappers,
			// Enforcement
			noticeRelatesToBuildingEngineeringMiningOther:
				lpaQuestionnaire.noticeRelatesToBuildingEngineeringMiningOther,
			siteAreaSquareMetres: lpaQuestionnaire.siteAreaSquareMetres
				? Number(lpaQuestionnaire.siteAreaSquareMetres)
				: null,
			areaOfAllegedBreachInSquareMetres: lpaQuestionnaire.areaOfAllegedBreachInSquareMetres
				? Number(lpaQuestionnaire.areaOfAllegedBreachInSquareMetres)
				: null,
			floorSpaceCreatedByBreachInSquareMetres:
				lpaQuestionnaire.floorSpaceCreatedByBreachInSquareMetres
					? Number(lpaQuestionnaire.floorSpaceCreatedByBreachInSquareMetres)
					: null,
			changeOfUseRefuseOrWaste: lpaQuestionnaire.changeOfUseRefuseOrWaste,
			changeOfUseMineralExtraction: lpaQuestionnaire.changeOfUseMineralExtraction,
			changeOfUseMineralStorage: lpaQuestionnaire.changeOfUseMineralStorage,
			relatesToErectionOfBuildingOrBuildings:
				lpaQuestionnaire.relatesToErectionOfBuildingOrBuildings,
			relatesToBuildingWithAgriculturalPurpose:
				lpaQuestionnaire.relatesToBuildingWithAgriculturalPurpose,
			relatesToBuildingSingleDwellingHouse: lpaQuestionnaire.relatesToBuildingSingleDwellingHouse,
			affectedTrunkRoadName: lpaQuestionnaire.affectedTrunkRoadName,
			isSiteOnCrownLand: lpaQuestionnaire.isSiteOnCrownLand,
			article4AffectedDevelopmentRights: lpaQuestionnaire.article4AffectedDevelopmentRights
		};
	}
};
