import { mapAdditionalDocumentsContents } from './submappers/map-additional-documents-contents.js';
import { mapAdditionalDocuments } from './submappers/map-additional-documents.js';
import { mapAffectsListedBuildingDetails } from './submappers/map-affects-listed-building-details.js';
import { mapAppealNotification } from './submappers/map-appeal-notification.js';
import { mapConservationAreaMap } from './submappers/map-conservation-area-map.js';
import { mapDevelopmentPlanPolicies } from './submappers/map-development-plan-policies.js';
import { mapExtraConditions } from './submappers/map-extra-conditions.js';
import { mapIsCorrectAppealType } from './submappers/map-is-correct-appeal-type.js';
import { mapLettersToNeighbours } from './submappers/map-letters-to-neighbours.js';
import { mapLpaHealthAndSafety } from './submappers/map-lpa-health-and-safety.js';
import { mapNotificationMethods } from './submappers/map-notification-methods.js';
import { mapNotifyingParties } from './submappers/map-notify-parties.js';
import { mapOfficersReport } from './submappers/map-officers-report.js';
import { mapOtherAppeals } from './submappers/map-other-appeals.js';
import { mapPressAdvert } from './submappers/map-press-advert.js';
import { mapRepresentations } from './submappers/map-representations.js';
import { mapReviewOutcome } from './submappers/map-review-outcome.js';
import { mapSiteAccess } from './submappers/map-site-access.js';
import { mapSiteNotice } from './submappers/map-site-notice.js';
import { mapSiteWithinGreenBelt } from './submappers/map-site-within-green-belt.js';
import { mapSupplementaryPlanning } from './submappers/map-supplementary-planning.js';

export const submaps = {
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
	developmentPlanPolicies: mapDevelopmentPlanPolicies,
	supplementaryPlanning: mapSupplementaryPlanning,
	siteAccess: mapSiteAccess,
	lpaHealthAndSafety: mapLpaHealthAndSafety,
	extraConditions: mapExtraConditions,
	otherAppeals: mapOtherAppeals,
	additionalDocumentsContents: mapAdditionalDocumentsContents,
	additionalDocuments: mapAdditionalDocuments,
	reviewOutcome: mapReviewOutcome
};
