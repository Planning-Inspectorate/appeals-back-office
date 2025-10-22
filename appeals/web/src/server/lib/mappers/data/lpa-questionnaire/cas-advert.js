import { mapAdditionalDocumentsContents } from './submappers/map-additional-documents-contents.js';
import { mapAdditionalDocuments } from './submappers/map-additional-documents.js';
import { mapAffectsListedBuildingDetails } from './submappers/map-affects-listed-building-details.js';
import { mapAffectsScheduledMonument } from './submappers/map-affects-scheduled-monument.js';
import { mapAppealNotification } from './submappers/map-appeal-notification.js';
import { mapConservationAreaMap } from './submappers/map-conservation-area-map.js';
import { mapInNearOrLikelyToAffectDesignatedSites } from './submappers/map-designated-sites.js';
import { mapDevelopmentPlanPolicies } from './submappers/map-development-plan-policies.js';
import { mapEiaConsultedBodiesDetails } from './submappers/map-eia-consulted-bodies-details.js';
import { mapEmergingPlan } from './submappers/map-emerging-plan.js';
import { mapExtraConditions } from './submappers/map-extra-conditions.js';
import { mapHasProtectedSpecies } from './submappers/map-has-protected-species.js';
import { mapIsAonbNationalLandscape } from './submappers/map-is-aonb-national-landscape.js';
import { mapIsCorrectAppealType } from './submappers/map-is-correct-appeal-type.js';
import { mapLettersToNeighbours } from './submappers/map-letters-to-neighbours.js';
import { mapLpaHealthAndSafety } from './submappers/map-lpa-health-and-safety.js';
import { mapNotificationMethods } from './submappers/map-notification-methods.js';
import { mapNotifyingParties } from './submappers/map-notify-parties.js';
import { mapOfficersReport } from './submappers/map-officers-report.js';
import { mapOtherAppeals } from './submappers/map-other-appeals.js';
import { mapOtherRelevantPolicies } from './submappers/map-other-relevant-policies.js';
import { mapPressAdvert } from './submappers/map-press-advert.js';
import { mapProcedurePreferenceDetails } from './submappers/map-procedure-preference-details.js';
import { mapProcedurePreferenceDuration } from './submappers/map-procedure-preference-duration.js';
import { mapProcedurePreference } from './submappers/map-procedure-preference.js';
import { mapReasonForNeighbourVisits } from './submappers/map-reason-for-neighbour-visits.js';
import { mapRepresentations } from './submappers/map-representations.js';
import { mapReviewOutcome } from './submappers/map-review-outcome.js';
import { mapSiteAccess } from './submappers/map-site-access.js';
import { mapSiteNotice } from './submappers/map-site-notice.js';
import { mapSiteWithinGreenBelt } from './submappers/map-site-within-green-belt.js';
import { mapSpecialControlOfAdvertisement } from './submappers/map-special-control-of-advertisements.js';
import { mapSupplementaryPlanning } from './submappers/map-supplementary-planning.js';

export const submaps = {
	isCorrectAppealType: mapIsCorrectAppealType,
	affectsListedBuildingDetails: mapAffectsListedBuildingDetails,
	affectsScheduledMonument: mapAffectsScheduledMonument,
	conservationAreaMap: mapConservationAreaMap,
	hasProtectedSpecies: mapHasProtectedSpecies,
	specialControlOfAdvertisment: mapSpecialControlOfAdvertisement,
	siteWithinGreenBelt: mapSiteWithinGreenBelt,
	isAonbNationalLandscape: mapIsAonbNationalLandscape,
	inNearOrLikelyToAffectDesignatedSites: mapInNearOrLikelyToAffectDesignatedSites,
	notifyingParties: mapNotifyingParties,
	notificationMethods: mapNotificationMethods,
	siteNotice: mapSiteNotice,
	lettersToNeighbours: mapLettersToNeighbours,
	pressAdvert: mapPressAdvert,
	appealNotification: mapAppealNotification,
	representations: mapRepresentations,
	consultedBodiesDetails: mapEiaConsultedBodiesDetails,
	officersReport: mapOfficersReport,
	developmentPlanPolicies: mapDevelopmentPlanPolicies,
	supplementaryPlanning: mapSupplementaryPlanning,
	emergingPlan: mapEmergingPlan,
	otherRelevantPolicies: mapOtherRelevantPolicies,
	siteAccess: mapSiteAccess,
	reasonForNeighbourVisits: mapReasonForNeighbourVisits,
	lpaHealthAndSafety: mapLpaHealthAndSafety,
	procedurePreference: mapProcedurePreference,
	procedurePreferenceDetails: mapProcedurePreferenceDetails,
	procedurePreferenceDuration: mapProcedurePreferenceDuration,
	extraConditions: mapExtraConditions,
	otherAppeals: mapOtherAppeals,
	reviewOutcome: mapReviewOutcome,
	additionalDocumentsContents: mapAdditionalDocumentsContents,
	additionalDocuments: mapAdditionalDocuments
};
