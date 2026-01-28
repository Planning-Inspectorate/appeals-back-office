import { mapRemovedPermittedDevelopmentRights } from '#lib/mappers/data/lpa-questionnaire/submappers/map-removed-permitted-development-rights.js';
import { removeQuestions } from './common.js';
import { submaps as s78Submaps } from './s78.js';
import { mapAllegedBreachCreatesFloorSpace } from './submappers/map-alleged-breach-creates-floor-space.js';
import { mapAppealNotification } from './submappers/map-appeal-notification.js';
import { mapChangeOfUseMineralStorage } from './submappers/map-change-of-use-mineral-storage.js';
import { mapChangeOfUseRefuseOrWaste } from './submappers/map-change-of-use-refuse-or-waste.js';
import { mapCrownLand } from './submappers/map-crown-land.js';
import { mapEnforcementBreachArea } from './submappers/map-enforcement-breach-area.js';
import { mapEnforcementList } from './submappers/map-enforcement-list.js';
import { mapNoticeRelatesToOperations } from './submappers/map-notice-relates-to-operations.js';
import { mapRelatesToAgriculturalPurpose } from './submappers/map-relates-to-agricultural-purpose.js';
import { mapRelatesToErectionOfBuildings } from './submappers/map-relates-to-erection-of-buildings.js';
import { mapRelatesToSingleDwellingHouse } from './submappers/map-relates-to-single-dwelling-house.js';
import { mapServedStopNotice } from './submappers/map-served-stop-notice.js';
import { mapSiteArea } from './submappers/map-site-area.js';
import { mapWithinTrunkRoadDistance } from './submappers/map-within-trunk-road-distance.js';
export const submaps = {
	// Inherit S78 submaps, but remove irrelevant document based questions
	...removeQuestions(['eiaScopingOpinion'], s78Submaps),
	// Section 1:
	noticeRelatesToOperations: mapNoticeRelatesToOperations,
	siteAreaSquareMetres: mapSiteArea,
	hasAllegedBreachArea: mapEnforcementBreachArea,
	allegedBreachCreatesFloorSpace: mapAllegedBreachCreatesFloorSpace,

	isSiteOnCrownLand: mapCrownLand,
	withinTrunkRoadDistance: mapWithinTrunkRoadDistance,
	changeOfUseRefuseOrWaste: mapChangeOfUseRefuseOrWaste,
	changeOfUseMineralStorage: mapChangeOfUseMineralStorage,
	relatesToErectionOfBuildings: mapRelatesToErectionOfBuildings,
	relatesToAgriculturalPurpose: mapRelatesToAgriculturalPurpose,
	relatesToSingleDwellingHouse: mapRelatesToSingleDwellingHouse,
	servedStopNotice: mapServedStopNotice,
	removedPermittedDevelopmentRights: mapRemovedPermittedDevelopmentRights,

	// Section 2:
	// Inherited from S78

	// Section 3:
	appealNotification: mapAppealNotification,
	enforcementList: mapEnforcementList

	// Section 4:

	// Section 5:

	// Section 6:
};
