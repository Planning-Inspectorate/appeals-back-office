import * as api from '#lib/api/allocation-details.api.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { ensureArray } from '#lib/array-utilities.js';
import {
	allocationCheckPage,
	allocationLevelPage,
	allocationSpecialismsPage,
	confirmPage
} from './valid.mapper.js';
import { setRepresentationStatus } from '../../representations.service.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export function renderAllocationCheck(request, response) {
	const { errors, currentAppeal, session } = request;

	const pageContent = allocationCheckPage(currentAppeal, session);

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
export function postAllocationCheck(request, response) {
	const {
		errors,
		params: { appealId },
		body
	} = request;

	if (errors) {
		return renderAllocationCheck(request, response);
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
	const { errors, currentAppeal, currentRepresentation, session } = request;

	const allocationLevels = await (async () => {
		const levels = await api.getAllocationDetailsLevels(request.apiClient);
		return levels.map((l) => l.level);
	})();

	const pageContent = allocationLevelPage(
		currentAppeal,
		currentRepresentation,
		allocationLevels,
		session
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

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderConfirm(request, response) {
	const { errors, currentAppeal, currentRepresentation, session } = request;

	const specialisms = await api.getAllocationDetailsSpecialisms(request.apiClient);

	const pageContent = confirmPage(currentAppeal, currentRepresentation, specialisms, session);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postAcceptStatement(request, response) {
	const {
		params: { appealId },
		session,
		currentRepresentation
	} = request;

	if (session.acceptLPAStatement.allocationLevelAndSpecialisms === 'yes') {
		const specialisms = ensureArray(session.acceptLPAStatement.allocationSpecialisms).map(Number);

		await api.setAllocationDetails(request.apiClient, appealId, {
			level: session.acceptLPAStatement.allocationLevel,
			specialisms
		});
	}

	await setRepresentationStatus(
		request.apiClient,
		parseInt(appealId),
		currentRepresentation.id,
		'valid'
	);

	addNotificationBannerToSession(session, 'lpaStatementAccepted', appealId);

	return response.redirect(`/appeals-service/appeal-details/${appealId}`);
}
