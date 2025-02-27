import { hasRowMaps } from './has.js';
import { mapAffectsScheduledMonument } from './row-mappers/map-affects-scheduled-monument.js';
import { mapCommunityInfrastructureLevy } from './row-mappers/map-community-infrastructure-levy.js';
import { mapConsultationResponses } from './row-mappers/map-consultation-responses.js';
import { mapDefinitiveMapStatement } from './row-mappers/map-definitive-map-statement.js';
import { mapEiaColumnTwoThreshold } from './row-mappers/map-eia-column-two-threshold.js';
import { mapEiaEnvironmentalStatement } from './row-mappers/map-eia-environmental-statement.js';
import { mapEiaRequiresEnvironmentalStatement } from './row-mappers/map-eia-requires-environmental-statement.js';
import { mapEiaScreeningDirection } from './row-mappers/map-eia-screening-direction.js';
import { mapEiaScreeningOpinion } from './row-mappers/map-eia-screening-opinion.js';
import { mapHasProtectedSpecies } from './row-mappers/map-has-protected-species.js';
import { mapIsAonbNationalLandscape } from './row-mappers/map-is-aonb-national-landscape.js';
import { mapIsGypsyOrTravellerSite } from './row-mappers/map-is-gypsy-or-traveller-site.js';
import { mapTreePreservationPlan } from './row-mappers/map-tree-preservation-plan.js';
import { mapHasCommunityInfrastructureLevy } from './row-mappers/map-has-community-infrastructure-levy.js';
import { mapIsInfrastructureLevyFormallyAdopted } from './row-mappers/map-is-infrastructure-levy-formally-adopted.js';
import { mapInfrastructureLevyAdoptedDate } from './row-mappers/map-infrastructure-levy-adopted-date.js';
import { mapInfrastructureLevyExpectedDate } from './row-mappers/map-infrastructure-levy-expected-date.js';
import { mapEiaEnvironmentalImpactSchedule } from './row-mappers/map-eia-environmental-impact-schedule.js';
import { mapEiaDevelopmentDescription } from './row-mappers/map-eia-development-description.js';
import { mapProcedurePreference } from './row-mappers/map-procedure-preference.js';
import { mapProcedurePreferenceDetails } from './row-mappers/map-procedure-preference-details.js';
import { mapProcedurePreferenceDuration } from './row-mappers/map-procedure-preference-duration.js';
import { mapOtherRelevantPolicies } from './row-mappers/map-other-relevant-policies.js';
import { mapEiaSensitiveAreaDetails } from './row-mappers/map-eia-sensitive-area-details.js';
import { mapEiaConsultedBodiesDetails } from './row-mappers/map-eia-consulted-bodies-details.js';
import { mapReasonForNeighbourVisits } from './row-mappers/map-reason-for-neighbour-visits.js';
import { mapInNearOrLikelyToAffectDesignatedSites } from './row-mappers/map-designated-sites.js';
import { mapChangedListedBuildingDetails } from './row-mappers/map-changed-listed-building-details.js';

export const s78RowMaps = {
	...hasRowMaps,
	eiaColumnTwoThreshold: mapEiaColumnTwoThreshold,
	eiaRequiresEnvironmentalStatement: mapEiaRequiresEnvironmentalStatement,
	treePreservationPlan: mapTreePreservationPlan,
	definitiveMapStatement: mapDefinitiveMapStatement,
	communityInfrastructureLevy: mapCommunityInfrastructureLevy,
	consultationResponses: mapConsultationResponses,
	eiaEnvironmentalStatement: mapEiaEnvironmentalStatement,
	eiaScreeningOpinion: mapEiaScreeningOpinion,
	eiaScreeningDirection: mapEiaScreeningDirection,
	affectsScheduledMonument: mapAffectsScheduledMonument,
	hasProtectedSpecies: mapHasProtectedSpecies,
	isGypsyOrTravellerSite: mapIsGypsyOrTravellerSite,
	isAonbNationalLandscape: mapIsAonbNationalLandscape,
	hasCommunityInfrastructureLevy: mapHasCommunityInfrastructureLevy,
	isInfrastructureLevyFormallyAdopted: mapIsInfrastructureLevyFormallyAdopted,
	infrastructureLevyAdoptedDate: mapInfrastructureLevyAdoptedDate,
	infrastructureLevyExpectedDate: mapInfrastructureLevyExpectedDate,
	eiaEnvironmentalImpactSchedule: mapEiaEnvironmentalImpactSchedule,
	eiaDevelopmentDescription: mapEiaDevelopmentDescription,
	procedurePreference: mapProcedurePreference,
	procedurePreferenceDetails: mapProcedurePreferenceDetails,
	procedurePreferenceDuration: mapProcedurePreferenceDuration,
	otherRelevantPolicies: mapOtherRelevantPolicies,
	eiaSensitiveAreaDetails: mapEiaSensitiveAreaDetails,
	consultedBodiesDetails: mapEiaConsultedBodiesDetails,
	reasonForNeighbourVisits: mapReasonForNeighbourVisits,
	inNearOrLikelyToAffectDesignatedSites: mapInNearOrLikelyToAffectDesignatedSites,
	changedListedBuildingDetails: mapChangedListedBuildingDetails
};
