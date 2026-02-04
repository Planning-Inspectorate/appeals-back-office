import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getAppealDetailsFromId } from '../appeal-details.service.js';
import {
	generateUnlinkAppealBackLinkUrl,
	manageLinkedAppealsPage,
	unlinkAppealPage
} from './linked-appeals.mapper.js';
import { postUnlinkRequest } from './linked-appeals.service.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderManageLinkedAppeals = async (request, response) => {
	const {
		errors,
		params: { appealId }
	} = request;

	const appealData = request.currentAppeal;

	const leadLinkedAppeal = appealData.isChildAppeal
		? appealData.linkedAppeals.find(
				(
					/** @type {import('@pins/appeals.api/src/server/endpoints/appeals.js').LinkedAppeal} */ linkedAppeal
				) => linkedAppeal.isParentAppeal
			)
		: undefined;

	const leadAppealData = leadLinkedAppeal?.appealId
		? await getAppealDetailsFromId(request.apiClient, leadLinkedAppeal.appealId)
		: undefined;

	if (appealData.isChildAppeal && !(leadLinkedAppeal && leadAppealData)) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = manageLinkedAppealsPage(
		appealData,
		appealId,
		leadLinkedAppeal,
		leadAppealData
	);

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
	const { appealId, relationshipId, backLinkAppealId } = request.params;
	const { unlinkAppeal } = request.body;
	const { errors } = request;

	if (errors) {
		return renderUnlinkAppeal(request, response);
	}

	switch (unlinkAppeal) {
		case 'no': {
			const backLinkUrl = generateUnlinkAppealBackLinkUrl(
				appealId,
				relationshipId,
				backLinkAppealId
			);

			return response.redirect(backLinkUrl);
		}
		case 'yes': {
			const appealRelationshipId = parseInt(relationshipId, 10);
			const appealData = request.currentAppeal;
			const childRef =
				appealData.linkedAppeals.find(
					(
						/** @type {import('@pins/appeals.api/src/server/endpoints/appeals.js').LinkedAppeal} */ linkedAppeal
					) => linkedAppeal.relationshipId === appealRelationshipId
				)?.appealReference || '';

			await postUnlinkRequest(request.apiClient, appealId, appealRelationshipId);

			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: 'appealUnlinked',
				appealId: backLinkAppealId,
				text: `You have unlinked this appeal from appeal ${
					appealId === backLinkAppealId ? childRef : appealData.appealReference
				}`
			});

			return response.redirect(`/appeals-service/appeal-details/${backLinkAppealId}`);
		}
		default:
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/change-appeal-type/change-appeal-final-date`
			);
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderUnlinkAppeal = (request, response) => {
	const {
		errors,
		params: { appealId, relationshipId, backLinkAppealId }
	} = request;

	const appealData = request.currentAppeal;

	const childRef =
		appealData.linkedAppeals.find(
			(
				/** @type {import('@pins/appeals.api/src/server/endpoints/appeals.js').LinkedAppeal} */ linkedAppeal
			) => linkedAppeal.relationshipId === parseInt(relationshipId, 10)
		)?.appealReference || '';

	const mappedPageContent = unlinkAppealPage(
		appealData,
		childRef,
		appealId,
		relationshipId,
		backLinkAppealId
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};
