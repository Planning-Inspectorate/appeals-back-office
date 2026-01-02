import * as api from '#lib/api/allocation-details.api.js';
import { ensureArray } from '#lib/array-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { checkRedactedText } from '#lib/validators/redacted-text.validator.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { redactAndAccept } from '../../representations.service.js';
import {
	allocationCheckPage,
	allocationLevelPage,
	allocationSpecialismsPage
} from '../allocation/allocation.mapper.js';
import { redactConfirmPage, redactRule6PartyStatementPage } from './redact.mapper.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderRedact(request, response) {
	const {
		errors,
		currentAppeal,
		currentRepresentation,
		session,
		params: { rule6PartyId }
	} = request;

	const pageContent = redactRule6PartyStatementPage(
		currentAppeal,
		currentRepresentation,
		rule6PartyId,
		session
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderConfirm(request, response) {
	const {
		errors,
		currentAppeal,
		currentRepresentation,
		session,
		params: { rule6PartyId }
	} = request;

	const specialisms = await api.getAllocationDetailsSpecialisms(request.apiClient);

	const pageContent = redactConfirmPage(
		currentAppeal,
		currentRepresentation,
		specialisms,
		rule6PartyId,
		session
	);

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
		params: { appealId, rule6PartyId },
		currentAppeal,
		currentRepresentation,
		session
	} = request;

	session.redactRule6PartyStatement.rule6PartyStatementId = currentRepresentation.id;

	if (currentRepresentation.status === APPEAL_REPRESENTATION_STATUS.PUBLISHED) {
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/redact/confirm`
		);
	}

	if (
		!currentAppeal.allocationDetails?.level ||
		!currentAppeal.allocationDetails?.specialisms?.length
	) {
		session.redactRule6PartyStatement.forcedAllocation = true;
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/redact/allocation-level`
		);
	}

	delete session.redactRule6PartyStatement?.forcedAllocation;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/redact/allocation-check`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export function renderAllocationCheck(request, response) {
	const {
		errors,
		currentAppeal,
		session,
		params: { rule6PartyId }
	} = request;

	const pageContent = allocationCheckPage(
		currentAppeal,
		'redact',
		rule6PartyId,
		session.redactRule6PartyStatement
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
		body
	} = request;

	if (errors) {
		return renderAllocationCheck(request, response);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/redact/${
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
	const {
		errors,
		currentAppeal,
		session,
		params: { rule6PartyId }
	} = request;

	const allocationLevels = await (async () => {
		const levels = await api.getAllocationDetailsLevels(request.apiClient);
		return levels.map((l) => l.level);
	})();

	const pageContent = allocationLevelPage(
		currentAppeal,
		allocationLevels,
		rule6PartyId,
		session.redactRule6PartyStatement,
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
		params: { appealId, rule6PartyId }
	} = request;

	if (errors) {
		return renderAllocationLevel(request, response);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/redact/allocation-specialisms`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderAllocationSpecialisms(request, response) {
	const {
		errors,
		currentAppeal,
		session,
		params: { rule6PartyId }
	} = request;
	const specialisms = await api.getAllocationDetailsSpecialisms(request.apiClient);
	const pageContent = allocationSpecialismsPage(
		currentAppeal,
		specialisms,
		rule6PartyId,
		session.redactRule6PartyStatement,
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
export function postAllocationSpecialisms(request, response) {
	const {
		errors,
		params: { appealId, rule6PartyId }
	} = request;

	if (errors) {
		return renderAllocationSpecialisms(request, response);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/redact/confirm`
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

	if (session.redactRule6PartyStatement.allocationSpecialisms) {
		const specialisms = ensureArray(session.redactRule6PartyStatement.allocationSpecialisms).map(
			Number
		);

		await api.setAllocationDetails(request.apiClient, appealId, {
			level: session.redactRule6PartyStatement.allocationLevel,
			specialisms
		});
	}
	const isRedacted = checkRedactedText(
		session.redactRule6PartyStatement.redactedRepresentation || '',
		currentRepresentation?.originalRepresentation || ''
	);
	await redactAndAccept(
		apiClient,
		parseInt(appealId),
		currentRepresentation.id,
		session.redactRule6PartyStatement.redactedRepresentation
	);
	delete session.redactRule6PartyStatement;

	if (!isRedacted) {
		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'rule6PartyStatementAccepted',
			appealId,
			text: `${currentRepresentation.author} statement accepted`
		});
	} else {
		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'rule6PartyStatementRedactedAndAccepted',
			appealId,
			text: `${currentRepresentation.author} statement redacted and accepted`
		});
	}

	return response.redirect(`/appeals-service/appeal-details/${appealId}`);
}
