import { mapLpaNeighbouringSites } from '../appeal/submappers/lpa-neighbouring-sites.mapper.js';
import { submaps as hasSubmaps } from './has.js';
import { mapCommunityInfrastructureLevy } from './submappers/map-community-infrastructure-levy.js';
import { mapHasCommunityInfrastructureLevy } from './submappers/map-has-community-infrastructure-levy.js';
import { mapInfrastructureLevyAdoptedDate } from './submappers/map-infrastructure-levy-adopted-date.js';
import { mapInfrastructureLevyExpectedDate } from './submappers/map-infrastructure-levy-expected-date.js';
import { mapIsInfrastructureLevyFormallyAdopted } from './submappers/map-is-infrastructure-levy-formally-adopted.js';
import { mapOtherAppeals } from './submappers/map-other-appeals.js';
import { mapProcedurePreferenceDetails } from './submappers/map-procedure-preference-details.js';
import { mapProcedurePreferenceDuration } from './submappers/map-procedure-preference-duration.js';
import { mapProcedurePreference } from './submappers/map-procedure-preference.js';
import { mapReasonForNeighbourVisits } from './submappers/map-reason-for-neighbour-visits.js';
import { mapSiteAccess } from './submappers/map-site-access.js';

export const submaps = {
	...hasSubmaps,
	hasCommunityInfrastructureLevy: mapHasCommunityInfrastructureLevy,
	communityInfrastructureLevy: mapCommunityInfrastructureLevy,
	isInfrastructureLevyFormallyAdopted: mapIsInfrastructureLevyFormallyAdopted,
	infrastructureLevyAdoptedDate: mapInfrastructureLevyAdoptedDate,
	infrastructureLevyExpectedDate: mapInfrastructureLevyExpectedDate,

	siteAccess: mapSiteAccess,
	reasonForNeighbourVisits: mapReasonForNeighbourVisits,
	lpaNeighbouringSites: mapLpaNeighbouringSites,

	procedurePreference: mapProcedurePreference,
	procedurePreferenceDetails: mapProcedurePreferenceDetails,
	procedurePreferenceDuration: mapProcedurePreferenceDuration,
	otherAppeals: mapOtherAppeals
};
