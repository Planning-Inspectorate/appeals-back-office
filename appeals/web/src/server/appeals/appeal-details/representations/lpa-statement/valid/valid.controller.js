import { render } from '../../common/render.js';
import {
	allocationCheckPage,
	allocationLevelPage,
	allocationSpecialismsPage,
	confirmPage
} from './valid.mapper.js';
import * as api from '#lib/api/allocation-details.api.js';

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

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderAllocationLevel(request, response) {
	const { errors, currentAppeal, currentRepresentation } = request;

	const allocationLevels = await (async () => {
		const levels = await api.getAllocationDetailsLevels(request.apiClient);
		return levels.map((l) => l.level);
	})();

	const pageContent = allocationLevelPage(
		currentAppeal,
		currentRepresentation,
		allocationLevels,
		request.session
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export function postAllocationLevel(request, response) {
	const {
		errors,
		params: { appealId }
	} = request;

	if (errors) {
		return renderAllocationLevel(request, response);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/lpa-statement/valid/allocation-specialisms`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderAllocationSpecialisms(request, response) {
	const { errors, currentAppeal, session } = request;

	const specialisms = await api.getAllocationDetailsSpecialisms(request.apiClient);
	const pageContent = allocationSpecialismsPage(currentAppeal, specialisms, session);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export function postAllocationSpecialisms(request, response) {
	const {
		errors,
		params: { appealId }
	} = request;

	if (errors) {
		return renderAllocationSpecialisms(request, response);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/lpa-statement/valid/confirm`
	);
}

export const renderConfirm = render(
	confirmPage,
	'patterns/check-and-confirm-page.pattern.njk',
	'currentRepresentation'
);

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export function postAcceptStatement(request, response) {
	const {
		params: { appealId }
	} = request;

	// TODO: Call API to accept statement

	return response.redirect(`/appeals-service/appeal-details/${appealId}/lpa-statement`);
}
