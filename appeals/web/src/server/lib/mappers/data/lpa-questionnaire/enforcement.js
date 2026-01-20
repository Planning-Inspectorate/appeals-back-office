import { submaps as s78Submaps } from './s78.js';

// Section 1: Individual Imports
import { mapAllegedBreachCreatesFloorSpace } from '#lib/mappers/data/lpa-questionnaire/submappers/map-alleged-breach-creates-floor-space.js';
import { mapChangeOfUseMineralStorage } from '#lib/mappers/data/lpa-questionnaire/submappers/map-change-of-use-mineral-storage.js';
import { mapChangeOfUseRefuseOrWaste } from '#lib/mappers/data/lpa-questionnaire/submappers/map-change-of-use-refuse-or-waste.js';
import { mapCrownLand } from '#lib/mappers/data/lpa-questionnaire/submappers/map-crown-land.js';
import { mapEnforcementBreachArea } from '#lib/mappers/data/lpa-questionnaire/submappers/map-enforcement-breach-area.js';
import { mapNoticeRelatesToOperations } from '#lib/mappers/data/lpa-questionnaire/submappers/map-notice-relates-to-operations.js';
import { mapRelatesToAgriculturalPurpose } from '#lib/mappers/data/lpa-questionnaire/submappers/map-relates-to-agricultural-purpose.js';
import { mapRelatesToErectionOfBuildings } from '#lib/mappers/data/lpa-questionnaire/submappers/map-relates-to-erection-of-buildings.js';
import { mapRelatesToSingleDwellingHouse } from '#lib/mappers/data/lpa-questionnaire/submappers/map-relates-to-single-dwelling-house.js';
import { mapRemovedPermittedDevelopmentRights } from '#lib/mappers/data/lpa-questionnaire/submappers/map-removed-permitted-development-rights.js';
import { mapServedStopNotice } from '#lib/mappers/data/lpa-questionnaire/submappers/map-served-stop-notice.js';
import { mapSiteArea } from '#lib/mappers/data/lpa-questionnaire/submappers/map-site-area.js';
import { mapWithinTrunkRoadDistance } from '#lib/mappers/data/lpa-questionnaire/submappers/map-within-trunk-road-distance.js';

// Section 3:
import { mapAppealNotification } from '#lib/mappers/data/lpa-questionnaire/submappers/map-appeal-notification.js';
import { mapServedNoticeList } from '#lib/mappers/data/lpa-questionnaire/submappers/map-served-notice-list.js';

/**
 * Enforcement submaps - Inherits all S78 questions and adds Enforcement-specific ones.
 */
export const submaps = {
	...s78Submaps, // Pre-existing
	// Section 1:
	isSiteOnCrownLand: mapCrownLand,
	siteAreaSquareMetres: mapSiteArea,
	withinTrunkRoadDistance: mapWithinTrunkRoadDistance,
	noticeRelatesToOperations: mapNoticeRelatesToOperations,
	allegedBreachCreatesFloorSpace: mapAllegedBreachCreatesFloorSpace,
	hasAllegedBreachArea: mapEnforcementBreachArea,
	changeOfUseRefuseOrWaste: mapChangeOfUseRefuseOrWaste,
	changeOfUseMineralStorage: mapChangeOfUseMineralStorage,
	relatesToErectionOfBuildings: mapRelatesToErectionOfBuildings,
	relatesToAgriculturalPurpose: mapRelatesToAgriculturalPurpose,
	relatesToSingleDwellingHouse: mapRelatesToSingleDwellingHouse,
	servedStopNotice: mapServedStopNotice,
	removedPermittedDevelopmentRights: mapRemovedPermittedDevelopmentRights,

	// Section 2:

	// Section 3:
	appealNotification: mapAppealNotification,
	servedNoticeList: mapServedNoticeList

	// Section 4:

	// Section 5:

	// Section 6:
};
