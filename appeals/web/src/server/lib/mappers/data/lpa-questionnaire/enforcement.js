import { mapRemovedPermittedDevelopmentRights } from '#lib/mappers/data/lpa-questionnaire/submappers/map-removed-permitted-development-rights.js';
import { submaps as casSubmaps } from './cas-planning.js';
import { removeQuestions } from './common.js';
import { submaps as s78Submaps } from './s78.js';
import { mapAllegedBreachCreatesFloorSpace } from './submappers/map-alleged-breach-creates-floor-space.js';
import { mapAppealNotification } from './submappers/map-appeal-notification.js';
import { mapArticle4Direction } from './submappers/map-article-4-direction.js';
import { mapChangeOfUseMineralExtraction } from './submappers/map-change-of-use-mineral-extraction.js';
import { mapChangeOfUseMineralStorage } from './submappers/map-change-of-use-mineral-storage.js';
import { mapChangeOfUseRefuseOrWaste } from './submappers/map-change-of-use-refuse-or-waste.js';
import { mapCrownLand } from './submappers/map-crown-land.js';
import { mapEnforcementBreachArea } from './submappers/map-enforcement-breach-area.js';
import { mapEnforcementList } from './submappers/map-enforcement-list.js';
import { mapNoticeRelatesToOperations } from './submappers/map-notice-relates-to-operations.js';
import { mapRelatesToAgriculturalPurpose } from './submappers/map-relates-to-agricultural-purpose.js';
import { mapRelatesToErectionOfBuildings } from './submappers/map-relates-to-erection-of-buildings.js';
import { mapRelatesToSingleDwellingHouse } from './submappers/map-relates-to-single-dwelling-house.js';
import { mapSiteArea } from './submappers/map-site-area.js';
import { mapStopNotice } from './submappers/map-stop-notice.js';
import { mapWithinTrunkRoadDistance } from './submappers/map-within-trunk-road-distance.js';

// Section 3:

// Section 4:
import { mapPlanningContraventionNotice } from '#lib/mappers/data/lpa-questionnaire/submappers/map-planning-contravetion-notice.js';
import { mapCommunityInfrastructureLevy } from './submappers/map-community-infrastructure-levy.js';
import { mapEnforcementNoticePlan } from './submappers/map-enforcement-notice-plan.js';
import { mapEnforcementNotice } from './submappers/map-enforcement-notice.js';
import { mapHasCommunityInfrastructureLevy } from './submappers/map-has-community-infrastructure-levy.js';
import { mapInfrastructureLevyAdoptedDate } from './submappers/map-infrastructure-levy-adopted-date.js';
import { mapInfrastructureLevyExpectedDate } from './submappers/map-infrastructure-levy-expected-date.js';
import { mapIsInfrastructureLevyFormallyAdopted } from './submappers/map-is-infrastructure-levy-formally-adopted.js';
import { mapLocalDevelopmentOrder } from './submappers/map-local-development-order.js';
import { mapPlanningPermission } from './submappers/map-planning-permission.js';

export const submaps = {
	...casSubmaps,
	// Inherit S78 submaps, but remove irrelevant document based questions
	...removeQuestions(['eiaScopingOpinion'], s78Submaps),
	// Section 1:
	noticeRelatesToOperations: mapNoticeRelatesToOperations,
	siteAreaSquareMetres: mapSiteArea,
	areaOfAllegedBreachInSquareMetres: mapEnforcementBreachArea,
	floorSpaceCreatedByBreachInSquareMetres: mapAllegedBreachCreatesFloorSpace,

	isSiteOnCrownLand: mapCrownLand,
	withinTrunkRoadDistance: mapWithinTrunkRoadDistance,
	changeOfUseRefuseOrWaste: mapChangeOfUseRefuseOrWaste,
	changeOfUseMineralExtraction: mapChangeOfUseMineralExtraction,
	changeOfUseMineralStorage: mapChangeOfUseMineralStorage,
	relatesToErectionOfBuildings: mapRelatesToErectionOfBuildings,
	relatesToAgriculturalPurpose: mapRelatesToAgriculturalPurpose,
	relatesToSingleDwellingHouse: mapRelatesToSingleDwellingHouse,
	stopNotice: mapStopNotice,
	article4Direction: mapArticle4Direction,
	removedPermittedDevelopmentRights: mapRemovedPermittedDevelopmentRights,

	// Section 2:
	// Inherited from S78

	// Section 3:
	appealNotification: mapAppealNotification,
	enforcementList: mapEnforcementList,

	// Section 4:

	hasCommunityInfrastructureLevy: mapHasCommunityInfrastructureLevy,
	communityInfrastructureLevy: mapCommunityInfrastructureLevy,
	isInfrastructureLevyFormallyAdopted: mapIsInfrastructureLevyFormallyAdopted,
	infrastructureLevyAdoptedDate: mapInfrastructureLevyAdoptedDate,
	infrastructureLevyExpectedDate: mapInfrastructureLevyExpectedDate,
	localDevelopmentOrder: mapLocalDevelopmentOrder,
	planningPermission: mapPlanningPermission,
	lpaEnforcementNotice: mapEnforcementNotice,
	lpaEnforcementNoticePlan: mapEnforcementNoticePlan,
	planningContraventionNotice: mapPlanningContraventionNotice

	// Section 5:

	// Section 6:
};
