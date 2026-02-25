import * as api from '#lib/api/allocation-details.api.js';
import { ensureArray } from '#lib/array-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { acceptRepresentation } from '../../representations.service.js';
import {
	allocationCheckPage,
	allocationLevelPage,
	allocationSpecialismsPage
} from '../allocation/allocation.mapper.js';
import { confirmPage } from './valid.mapper.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export function renderAllocationCheck(request, response) {
	const { errors, currentAppeal, session } = request;
	const { rule6PartyId } = request.params;

	const pageContent = allocationCheckPage(
		currentAppeal,
		'valid',
		rule6PartyId,
		session.acceptRule6PartyStatement?.[currentAppeal.appealId]
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
export function postAllocationCheck(request, response) {
	const {
		errors,
		params: { appealId, rule6PartyId },
		body,
		currentAppeal,
		session
	} = request;

	if (errors) {
		return renderAllocationCheck(request, response);
	}

	if (
		session.acceptRule6PartyStatement[currentAppeal.appealId] &&
		body.allocationLevelAndSpecialisms === 'no'
	) {
		delete session.acceptRule6PartyStatement[currentAppeal.appealId].allocationLevel;
		delete session.acceptRule6PartyStatement[currentAppeal.appealId].allocationSpecialisms;
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/valid/${
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
	const { errors, currentAppeal, session } = request;
	const { rule6PartyId } = request.params;

	const allocationLevels = await (async () => {
		const levels = await api.getAllocationDetailsLevels(request.apiClient);
		return levels.map((l) => l.level);
	})();

	const pageContent = allocationLevelPage(
		currentAppeal,
		allocationLevels,
		rule6PartyId,
		session.acceptRule6PartyStatement?.[currentAppeal.appealId],
		'valid'
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
		params: { appealId, rule6PartyId }
	} = request;

	if (errors) {
		return renderAllocationLevel(request, response);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/valid/allocation-specialisms`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderAllocationSpecialisms(request, response) {
	const { errors, currentAppeal, session } = request;
	const { rule6PartyId } = request.params;

	const specialisms = await api.getAllocationDetailsSpecialisms(request.apiClient);
	const pageContent = allocationSpecialismsPage(
		currentAppeal,
		specialisms,
		rule6PartyId,
		session.acceptRule6PartyStatement?.[currentAppeal.appealId],
		'valid'
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
		params: { appealId, rule6PartyId }
	} = request;

	if (errors) {
		return renderAllocationSpecialisms(request, response);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/valid/confirm`
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

	const { rule6PartyId } = request.params;
	const pageContent = confirmPage(
		currentAppeal,
		currentRepresentation,
		specialisms,
		session,
		rule6PartyId
	);

	return response.status(200).render('patterns/check-and-confirm-page-full-width.pattern.njk', {
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
		apiClient,
		params: { appealId },
		session,
		currentAppeal,
		currentRepresentation
	} = request;

	if (
		session.acceptRule6PartyStatement?.[currentAppeal.appealId].allocationLevelAndSpecialisms ===
			'yes' ||
		session.acceptRule6PartyStatement?.[currentAppeal.appealId].forcedAllocation
	) {
		const specialisms = ensureArray(
			session.acceptRule6PartyStatement[currentAppeal.appealId].allocationSpecialisms
		).map(Number);

		await api.setAllocationDetails(request.apiClient, appealId, {
			level: session.acceptRule6PartyStatement[currentAppeal.appealId].allocationLevel,
			specialisms
		});
	}

	await acceptRepresentation(apiClient, parseInt(currentAppeal.appealId), currentRepresentation.id);

	addNotificationBannerToSession({
		session,
		bannerDefinitionKey: 'rule6PartyStatementAccepted',
		appealId,
		text: `${currentRepresentation.author} statement accepted`
	});

	return response.redirect(`/appeals-service/appeal-details/${appealId}`);
}
