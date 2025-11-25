import { apiAdvertMappers } from './advert/index.js';
import { apiCasAdvertMappers } from './cas-advert/index.js';
import { apiEnforcementMappers } from './enforcement/index.js';
import { apiS20Mappers } from './s20/index.js';
import { apiS78Mappers } from './s78/index.js';
import { apiSharedMappers } from './shared/index.js';

export const apiMappers = {
	apiSharedMappers,
	apiS78Mappers,
	apiS20Mappers,
	apiCasAdvertMappers,
	apiAdvertMappers,
	apiEnforcementMappers
};
