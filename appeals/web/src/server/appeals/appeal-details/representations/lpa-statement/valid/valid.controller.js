import { render } from '../../common/render.js';
import { allocationCheckPage } from './valid.mapper.js';

export const renderAllocationCheck = render(
	allocationCheckPage,
	'patterns/change-page.pattern.njk',
	'currentRepresentation'
);

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {() => void} next
 */
export function postAllocationCheck(request, response, next) {
	const {
		errors,
		params: { appealId },
		body
	} = request;

	if (errors) {
		return renderAllocationCheck(request, response, next);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/lpa-statement/valid/${
			body.allocationLevelAndSpecialisms === 'yes' ? 'allocation-level' : 'confirm'
		}`
	);
}
