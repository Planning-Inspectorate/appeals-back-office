import { integrationAdvertMappers } from './advert/index.js';
import { integrationCasAdvertMappers } from './cas-advert/index.js';
import { integrationEnforcementListedMappers } from './enforcement-listed/index.js';
import { integrationEnforcementMappers } from './enforcement/index.js';
import { integrationLDCMappers } from './ldc/index.js';
import { integrationS20Mappers } from './s20/index.js';
import { integrationS78Mappers } from './s78/index.js';
import { integrationSharedMappers } from './shared/index.js';

export const integrationMappers = {
	integrationAdvertMappers,
	integrationCasAdvertMappers,
	integrationEnforcementMappers,
	integrationEnforcementListedMappers,
	integrationLDCMappers,
	integrationSharedMappers,
	integrationS78Mappers,
	integrationS20Mappers
};
