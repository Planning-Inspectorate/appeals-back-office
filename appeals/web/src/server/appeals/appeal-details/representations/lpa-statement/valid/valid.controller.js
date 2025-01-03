import { render } from '../../common/render.js';
import { allocationCheckPage } from './valid.mapper.js';

export const renderAllocationCheck = render(
	allocationCheckPage,
	'patterns/change-page.pattern.njk',
	'currentRepresentation'
);
