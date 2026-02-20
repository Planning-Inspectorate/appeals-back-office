import { appealShortReference } from '#lib/appeals-formatter.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { LINK_APPEALS_UNLINK_OPERATION } from '@pins/appeals/constants/support.js';
import {
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
	const { errors } = request;
	const appealData = request.currentAppeal;
	const mappedPageContent = manageLinkedAppealsPage(appealData);

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

	if (currentAppeal.linkedAppeals.length > 1) {
		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/linked-appeals/manage`
		);
	}

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

	const mappedPageContent = unlinkAppealPage(appealData, childRef, appealId);

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

	const confirmPath =
		operation === LINK_APPEALS_UNLINK_OPERATION
			? 'confirm-unlink-lead-appeal'
			: 'confirm-change-lead-appeal';

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/linked-appeals/${confirmPath}`
	);
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
export const postConfirmChangeLeadAppeal = (operation) => async (request, response) => {
	const { currentAppeal, session } = request;

	await postUpdateLinkedAppealsRequest(
		request.apiClient,
		currentAppeal.appealId,
		appealShortReference(session?.leadAppeal?.appealReference) ?? '',
		operation
	);

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey:
			operation === LINK_APPEALS_UNLINK_OPERATION ? 'appealUnlinked' : 'leadAppealChanged',
		appealId: currentAppeal.appealId,
		text: operation === LINK_APPEALS_UNLINK_OPERATION ? 'Appeal unlinked' : 'Lead appeal changed'
	});

	return response.redirect(
		`/appeals-service/appeal-details/${session.leadAppeal.appealId}/linked-appeals/manage`
	);
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
