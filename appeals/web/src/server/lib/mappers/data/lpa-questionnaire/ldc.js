import { mapLpaNeighbouringSites } from '../appeal/submappers/lpa-neighbouring-sites.mapper.js';
import { submaps as hasSubmaps } from './has.js';
import { mapAppealUnderActSection } from './submappers/map-appeal-under-act-section.js';
import { mapCommunityInfrastructureLevy } from './submappers/map-community-infrastructure-levy.js';
import { mapEnforcementNotice } from './submappers/map-enforcement-notice.js';
import { mapHasCommunityInfrastructureLevy } from './submappers/map-has-community-infrastructure-levy.js';
import { mapInfrastructureLevyAdoptedDate } from './submappers/map-infrastructure-levy-adopted-date.js';
import { mapInfrastructureLevyExpectedDate } from './submappers/map-infrastructure-levy-expected-date.js';
import { mapIsAppealInvalid } from './submappers/map-is-appeal-invalid.js';
import { mapIsInfrastructureLevyFormallyAdopted } from './submappers/map-is-infrastructure-levy-formally-adopted.js';
import { mapOtherAppeals } from './submappers/map-other-appeals.js';
import { mapOtherRelevantMatters } from './submappers/map-other-relevant-matter.js';
import { mapPlanningPermission } from './submappers/map-planning-permission-ldc.js';
import { mapProcedurePreferenceDetails } from './submappers/map-procedure-preference-details.js';
import { mapProcedurePreferenceDuration } from './submappers/map-procedure-preference-duration.js';
import { mapProcedurePreference } from './submappers/map-procedure-preference.js';
import { mapReasonForNeighbourVisits } from './submappers/map-reason-for-neighbour-visits.js';
import { mapRelatedApplications } from './submappers/map-related-applications.js';
import { mapSiteAccess } from './submappers/map-site-access.js';

export const submaps = {
	...hasSubmaps,
	//Section 1
	appealUnderActSection: mapAppealUnderActSection,
	planningPermission: mapPlanningPermission,
	enforcementNotice: mapEnforcementNotice,
	relatedApplications: mapRelatedApplications,
	lpaConsiderAppealInvalid: mapIsAppealInvalid,

	//Section 2
	hasCommunityInfrastructureLevy: mapHasCommunityInfrastructureLevy,
	communityInfrastructureLevy: mapCommunityInfrastructureLevy,
	isInfrastructureLevyFormallyAdopted: mapIsInfrastructureLevyFormallyAdopted,
	infrastructureLevyAdoptedDate: mapInfrastructureLevyAdoptedDate,
	infrastructureLevyExpectedDate: mapInfrastructureLevyExpectedDate,
	otherRelevantMatters: mapOtherRelevantMatters,

	//Section 3
	siteAccess: mapSiteAccess,
	reasonForNeighbourVisits: mapReasonForNeighbourVisits,
	lpaNeighbouringSites: mapLpaNeighbouringSites,

	//Section 4
	procedurePreference: mapProcedurePreference,
	procedurePreferenceDetails: mapProcedurePreferenceDetails,
	procedurePreferenceDuration: mapProcedurePreferenceDuration,
	otherAppeals: mapOtherAppeals
};
