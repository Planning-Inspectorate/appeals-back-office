import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { manageLinkedAppealsPage, unlinkAppealPage } from './linked-appeals.mapper.js';
import { postUnlinkRequest } from './linked-appeals.service.js';

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

	await postUnlinkRequest(request.apiClient, appealId);

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
