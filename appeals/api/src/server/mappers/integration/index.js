import { integrationS20Mappers } from './s20/index.js';
import { integrationS78Mappers } from './s78/index.js';
import { integrationSharedMappers } from './shared/index.js';

export const integrationMappers = {
	integrationSharedMappers,
	integrationS78Mappers,
	integrationS20Mappers
};
