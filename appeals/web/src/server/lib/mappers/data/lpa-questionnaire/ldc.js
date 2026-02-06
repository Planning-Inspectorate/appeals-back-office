import { submaps as hasSubmaps } from './has.js';
import { mapCommunityInfrastructureLevy } from './submappers/map-community-infrastructure-levy.js';
import { mapHasCommunityInfrastructureLevy } from './submappers/map-has-community-infrastructure-levy.js';
import { mapInfrastructureLevyAdoptedDate } from './submappers/map-infrastructure-levy-adopted-date.js';
import { mapInfrastructureLevyExpectedDate } from './submappers/map-infrastructure-levy-expected-date.js';
import { mapIsInfrastructureLevyFormallyAdopted } from './submappers/map-is-infrastructure-levy-formally-adopted.js';

export const submaps = {
	...hasSubmaps,
	hasCommunityInfrastructureLevy: mapHasCommunityInfrastructureLevy,
	communityInfrastructureLevy: mapCommunityInfrastructureLevy,
	isInfrastructureLevyFormallyAdopted: mapIsInfrastructureLevyFormallyAdopted,
	infrastructureLevyAdoptedDate: mapInfrastructureLevyAdoptedDate,
	infrastructureLevyExpectedDate: mapInfrastructureLevyExpectedDate
};
