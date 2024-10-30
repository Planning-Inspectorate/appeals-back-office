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
import { mapHasProtectedSpecies } from './submappers/map-has-protected-species.js';
import { mapIsAonbNationalLandscape } from './submappers/map-is-aonb-national-landscape.js';
import { mapIsGypsyOrTravellerSite } from './submappers/map-is-gypsy-or-traveller-site.js';
import { mapTreePreservationPlan } from './submappers/map-tree-preservation-plan.js';
import { mapIsInfrastructureLevyFormallyAdopted } from './submappers/map-is-infrastructure-levy-formally-adopted.js';

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
	affectsScheduledMonument: mapAffectsScheduledMonument,
	hasProtectedSpecies: mapHasProtectedSpecies,
	isGypsyOrTravellerSite: mapIsGypsyOrTravellerSite,
	isAonbNationalLandscape: mapIsAonbNationalLandscape,
	isInfrastructureLevyFormallyAdopted: mapIsInfrastructureLevyFormallyAdopted
};
