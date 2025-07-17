import { submaps as hasSubmaps } from './has.js';
import { mapAffectsScheduledMonument } from './submappers/map-affects-scheduled-monument.js';
import { mapCommunityInfrastructureLevy } from './submappers/map-community-infrastructure-levy.js';
import { mapConsultationResponses } from './submappers/map-consultation-responses.js';
import { mapDefinitiveMapStatement } from './submappers/map-definitive-map-statement.js';
import { mapEiaColumnTwoThreshold } from './submappers/map-eia-column-two-threshold.js';
import { mapEiaEnvironmentalStatement } from './submappers/map-eia-environmental-statement.js';
import { mapEiaRequiresEnvironmentalStatement } from './submappers/map-eia-requires-environmental-statement.js';
import { mapEiaScreeningDirection } from './submappers/map-eia-screening-direction.js';
import { mapEiaScreeningOpinion } from './submappers/map-eia-screening-opinion.js';
import { mapEiaScopingOpinion } from './submappers/map-eia-scoping-opinion.js';
import { mapHasProtectedSpecies } from './submappers/map-has-protected-species.js';
import { mapIsAonbNationalLandscape } from './submappers/map-is-aonb-national-landscape.js';
import { mapIsGypsyOrTravellerSite } from './submappers/map-is-gypsy-or-traveller-site.js';
import { mapTreePreservationPlan } from './submappers/map-tree-preservation-plan.js';
import { mapHasCommunityInfrastructureLevy } from './submappers/map-has-community-infrastructure-levy.js';
import { mapIsInfrastructureLevyFormallyAdopted } from './submappers/map-is-infrastructure-levy-formally-adopted.js';
import { mapInfrastructureLevyAdoptedDate } from './submappers/map-infrastructure-levy-adopted-date.js';
import { mapInfrastructureLevyExpectedDate } from './submappers/map-infrastructure-levy-expected-date.js';
import { mapEiaEnvironmentalImpactSchedule } from './submappers/map-eia-environmental-impact-schedule.js';
import { mapEiaDevelopmentDescription } from './submappers/map-eia-development-description.js';
import { mapProcedurePreference } from './submappers/map-procedure-preference.js';
import { mapProcedurePreferenceDetails } from './submappers/map-procedure-preference-details.js';
import { mapProcedurePreferenceDuration } from './submappers/map-procedure-preference-duration.js';
import { mapOtherRelevantPolicies } from './submappers/map-other-relevant-policies.js';
import { mapEiaSensitiveAreaDetails } from './submappers/map-eia-sensitive-area-details.js';
import { mapEiaConsultedBodiesDetails } from './submappers/map-eia-consulted-bodies-details.js';
import { mapReasonForNeighbourVisits } from './submappers/map-reason-for-neighbour-visits.js';
import { mapInNearOrLikelyToAffectDesignatedSites } from './submappers/map-designated-sites.js';
import { mapChangedListedBuildingDetails } from './submappers/map-changed-listed-building-details.js';

export const submaps = {
	...hasSubmaps,
	eiaColumnTwoThreshold: mapEiaColumnTwoThreshold,
	eiaRequiresEnvironmentalStatement: mapEiaRequiresEnvironmentalStatement,
	treePreservationPlan: mapTreePreservationPlan,
	definitiveMapStatement: mapDefinitiveMapStatement,
	communityInfrastructureLevy: mapCommunityInfrastructureLevy,
	consultationResponses: mapConsultationResponses,
	eiaEnvironmentalStatement: mapEiaEnvironmentalStatement,
	eiaScreeningOpinion: mapEiaScreeningOpinion,
	eiaScreeningDirection: mapEiaScreeningDirection,
	eiaScopingOpinion: mapEiaScopingOpinion,
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
