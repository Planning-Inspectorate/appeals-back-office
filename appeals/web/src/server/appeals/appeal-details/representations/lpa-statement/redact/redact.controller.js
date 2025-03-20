import * as api from '#lib/api/allocation-details.api.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { ensureArray } from '#lib/array-utilities.js';
import { render } from '../../common/render.js';
import { redactLpaStatementPage, redactConfirmPage } from './redact.mapper.js';
import { redactAndAccept } from '../../representations.service.js';
import {
	allocationCheckPage,
	allocationLevelPage,
	allocationSpecialismsPage
} from '../allocation/allocation.mapper.js';

export const renderRedact = render(redactLpaStatementPage, 'patterns/display-page.pattern.njk');

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderConfirm(request, response) {
	const { errors, currentAppeal, currentRepresentation, session } = request;

	const specialisms = await api.getAllocationDetailsSpecialisms(request.apiClient);

	const pageContent = redactConfirmPage(currentAppeal, currentRepresentation, specialisms, session);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		errors,
		pageContent
	});
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export function postRedact(request, response) {
	const {
		params: { appealId },
		currentAppeal,
		session
	} = request;

	if (
		!currentAppeal.allocationDetails?.level ||
		!currentAppeal.allocationDetails?.specialisms?.length
	) {
		session.redactLPAStatement.forcedAllocation = true;
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-statement/redact/allocation-level`
		);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/lpa-statement/redact/allocation-check`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export function renderAllocationCheck(request, response) {
	const { errors, currentAppeal, session } = request;

	const pageContent = allocationCheckPage(currentAppeal, session.redactLPAStatement);

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
		`/appeals-service/appeal-details/${appealId}/lpa-statement/redact/${
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
		session.redactLPAStatement,
		'redact'
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
		`/appeals-service/appeal-details/${appealId}/lpa-statement/redact/allocation-specialisms`
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
	const pageContent = allocationSpecialismsPage(
		currentAppeal,
		specialisms,
		session.redactLPAStatement
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
export function postAllocationSpecialisms(request, response) {
	const {
		errors,
		params: { appealId }
	} = request;

	if (errors) {
		return renderAllocationSpecialisms(request, response);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/lpa-statement/redact/confirm`
	);
}
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export async function postConfirm(request, response) {
	const {
		params: { appealId },
		session,
		apiClient,
		currentRepresentation
	} = request;

	if (session.redactLPAStatement.allocationSpecialisms) {
		const specialisms = ensureArray(session.redactLPAStatement.allocationSpecialisms).map(Number);

		await api.setAllocationDetails(request.apiClient, appealId, {
			level: session.redactLPAStatement.allocationLevel,
			specialisms
		});
	}

	await redactAndAccept(
		apiClient,
		parseInt(appealId),
		currentRepresentation.id,
		session.redactLPAStatement.redactedRepresentation
	);

	delete session.redactLPAStatement;

	addNotificationBannerToSession({
		session,
		bannerDefinitionKey: 'lpaStatementRedactedAndAccepted',
		appealId
	});

	return response.redirect(`/appeals-service/appeal-details/${appealId}`);
}
