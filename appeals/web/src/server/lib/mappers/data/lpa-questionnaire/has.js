import { mapAdditionalDocumentsContents } from './row-mappers/map-additional-documents-contents.js';
import { mapAdditionalDocuments } from './row-mappers/map-additional-documents.js';
import { mapAffectsListedBuildingDetails } from './row-mappers/map-affects-listed-building-details.js';
import { mapConservationAreaMap } from './row-mappers/map-conservation-area-map.js';
import { mapDevelopmentPlanPolicies } from './row-mappers/map-development-plan-policies.js';
import { mapEmergingPlan } from './row-mappers/map-emerging-plan.js';
import { mapExtraConditions } from './row-mappers/map-extra-conditions.js';
import { mapIsCorrectAppealType } from './row-mappers/map-is-correct-appeal-type.js';
import { mapLettersToNeighbours } from './row-mappers/map-letters-to-neighbours.js';
import { mapLpaHealthAndSafety } from './row-mappers/map-lpa-health-and-safety.js';
import { mapNotificationMethods } from './row-mappers/map-notification-methods.js';
import { mapNotifyingParties } from './row-mappers/map-notify-parties.js';
import { mapOfficersReport } from './row-mappers/map-officers-report.js';
import { mapOtherAppeals } from './row-mappers/map-other-appeals.js';
import { mapPlansDrawings } from './row-mappers/map-plans-drawings.js';
import { mapPressAdvert } from './row-mappers/map-press-advert.js';
import { mapRepresentations } from './row-mappers/map-representations.js';
import { mapReviewOutcome } from './row-mappers/map-review-outcome.js';
import { mapSiteAccess } from './row-mappers/map-site-access.js';
import { mapSiteNotice } from './row-mappers/map-site-notice.js';
import { mapSiteWithinGreenBelt } from './row-mappers/map-site-within-green-belt.js';
import { mapSupplementaryPlanning } from './row-mappers/map-supplementary-planning.js';
import { mapAppealNotification } from './row-mappers/map-appeal-notification.js';

export const hasRowMaps = {
	affectsListedBuildingDetails: mapAffectsListedBuildingDetails,
	isCorrectAppealType: mapIsCorrectAppealType,
	conservationAreaMap: mapConservationAreaMap,
	siteWithinGreenBelt: mapSiteWithinGreenBelt,
	notifyingParties: mapNotifyingParties,
	siteNotice: mapSiteNotice,
	lettersToNeighbours: mapLettersToNeighbours,
	pressAdvert: mapPressAdvert,
	appealNotification: mapAppealNotification,
	notificationMethods: mapNotificationMethods,
	representations: mapRepresentations,
	officersReport: mapOfficersReport,
	plansDrawings: mapPlansDrawings,
	developmentPlanPolicies: mapDevelopmentPlanPolicies,
	supplementaryPlanning: mapSupplementaryPlanning,
	emergingPlan: mapEmergingPlan,
	siteAccess: mapSiteAccess,
	lpaHealthAndSafety: mapLpaHealthAndSafety,
	extraConditions: mapExtraConditions,
	otherAppeals: mapOtherAppeals,
	additionalDocumentsContents: mapAdditionalDocumentsContents,
	additionalDocuments: mapAdditionalDocuments,
	reviewOutcome: mapReviewOutcome
};
