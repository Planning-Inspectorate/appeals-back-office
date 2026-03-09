import { appealShortReference } from '#lib/appeals-formatter.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	LINK_APPEALS_CHANGE_LEAD_OPERATION,
	LINK_APPEALS_UNLINK_OPERATION
} from '@pins/appeals/constants/support.js';
import {
	changeLeadAppealEmailPage,
	changeLeadAppealPage,
	confirmChangeLeadAppealPage,
	manageLinkedAppealsPage,
	unlinkAppealPage
} from './linked-appeals.mapper.js';
import { postUpdateLinkedAppealsRequest } from './linked-appeals.service.js';

/**
 * @typedef {import('@pins/appeals.api/src/server/endpoints/appeals.js').LinkedAppeal} LinkedAppeal
 */

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderManageLinkedAppeals = async (request, response) => {
	const { errors, session } = request;
	const appealData = request.currentAppeal;

	const mappedPageContent = manageLinkedAppealsPage(appealData, session);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postUnlinkAppeal = async (request, response) => {
	const { currentAppeal } = request;
	const { appealId } = request.params;

	await postUpdateLinkedAppealsRequest(request.apiClient, appealId);

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey: 'appealUnlinked',
		appealId: currentAppeal.appealId,
		text: 'Appeal unlinked'
	});

	return response.redirect(`/appeals-service/appeal-details/${currentAppeal.appealId}`);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderUnlinkAppeal = (request, response) => {
	const {
		errors,
		params: { appealId }
	} = request;

	const appealData = request.currentAppeal;

	const linkedAppeals = [appealData, ...appealData.linkedAppeals];

	const childRef =
		linkedAppeals.find(
			(
				/** @type {import('@pins/appeals.api/src/server/endpoints/appeals.js').LinkedAppeal} */ linkedAppeal
			) => linkedAppeal.appealId === Number(appealId)
		)?.appealReference || '';

	const mappedPageContent = unlinkAppealPage(appealData, childRef);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {string} operation
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const postChangeLeadAppeal = (operation) => async (request, response) => {
	const { currentAppeal, body, session, errors } = request;

	if (errors) {
		// @ts-ignore
		return renderChangeLeadAppeal(operation)(request, response);
	}

	session.leadAppeal = currentAppeal.linkedAppeals.find(
		(/** @type {LinkedAppeal} */ linkedAppeal) => linkedAppeal.appealId === Number(body.leadAppeal)
	);

	const appellantEmail = session.leadAppeal?.appellant?.email;

	const basePath = `/appeals-service/appeal-details/${currentAppeal.appealId}/linked-appeals`;

	switch (operation) {
		case LINK_APPEALS_UNLINK_OPERATION:
			// @ts-ignore
			if (appellantEmail) {
				return response.redirect(`${basePath}/confirm-unlink-lead-appeal`);
			} else {
				return response.redirect(`${basePath}/unlink-new-lead-email`);
			}
		case LINK_APPEALS_CHANGE_LEAD_OPERATION:
			// @ts-ignore
			if (appellantEmail) {
				return response.redirect(`${basePath}/confirm-change-lead-appeal`);
			} else {
				return response.redirect(`${basePath}/change-new-lead-email`);
			}
		default:
			throw new Error(`Invalid operation: ${operation}`);
	}
};

/**
 * @param {string} operation
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const renderChangeLeadAppeal = (operation) => (request, response) => {
	const { currentAppeal, session, errors } = request;

	const mappedPageContent = changeLeadAppealPage(
		currentAppeal,
		session.leadAppeal,
		operation,
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {string} operation
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const postChangeLeadEmail = (operation) => (request, response) => {
	const { currentAppeal, session, body, errors } = request;

	if (errors) {
		// @ts-ignore
		return renderChangeLeadEmail(operation)(request, response);
	}

	const confirmPath =
		operation === LINK_APPEALS_UNLINK_OPERATION
			? 'confirm-unlink-lead-appeal'
			: 'confirm-change-lead-appeal';

	if (session.leadAppeal?.appellant) {
		session.leadAppeal.appellant.email = body.email;
	}

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/linked-appeals/${confirmPath}`
	);
};

/**
 * @param {string} operation
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const renderChangeLeadEmail = (operation) => async (request, response) => {
	const { currentAppeal, session, errors } = request;
	const mappedPageContent = changeLeadAppealEmailPage(
		currentAppeal,
		session.leadAppeal,
		operation,
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {string} operation
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const postConfirmChangeLeadAppeal = (operation) => async (request, response) => {
	const { currentAppeal, session } = request;

	const { leadAppeal } = session;

	await postUpdateLinkedAppealsRequest(
		request.apiClient,
		currentAppeal.appealId,
		appealShortReference(leadAppeal?.appealReference) ?? '',
		leadAppeal?.appellant?.email ?? '',
		operation
	);

	if (operation === LINK_APPEALS_UNLINK_OPERATION) {
		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'appealUnlinked',
			appealId: currentAppeal.appealId,
			text: 'Appeal unlinked'
		});
	}

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey: 'leadAppealChanged',
		appealId: currentAppeal.appealId,
		text: 'Lead appeal changed'
	});

	return response.redirect(`/appeals-service/appeal-details/${currentAppeal.appealId}`);
};

/**
 * @param {string} operation
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const renderConfirmChangeLeadAppeal = (operation) => (request, response) => {
	const { currentAppeal, session, errors } = request;

	if (!session.leadAppeal) {
		if (currentAppeal.linkedAppeals.length > 1) {
			return response.redirect(
				`/appeals-service/appeal-details/${currentAppeal.appealId}/linked-appeals/manage`
			);
		}
		session.leadAppeal = currentAppeal.linkedAppeals[0];
	}

	const mappedPageContent = confirmChangeLeadAppealPage(
		currentAppeal,
		session.leadAppeal,
		operation
	);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};
