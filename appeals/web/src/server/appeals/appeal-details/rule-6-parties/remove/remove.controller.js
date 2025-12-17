import logger from '#lib/logger.js';
import { getSavedBackUrl } from '#lib/middleware/save-back-url.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { confirmRemoveRule6PartyPage } from '../rule-6-parties.mapper.js';
import { deleteRule6Party } from '../rule-6-parties.service.js';

/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').AppealRule6Party} AppealRule6Party */

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getConfirm = async (request, response) => {
	const {
		currentAppeal,
		params: { rule6PartyId }
	} = request;
	const rule6Party = currentAppeal.appealRule6Parties.find(
		(/** @type {AppealRule6Party} */ rule6Party) => rule6Party.id === Number(rule6PartyId)
	);
	const backLinkUrl =
		getSavedBackUrl(request, 'removeRule6Party') ||
		`/appeals-service/appeal-details/${currentAppeal.appealId}`;

	const mappedPageContent = confirmRemoveRule6PartyPage(currentAppeal, rule6Party, backLinkUrl);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postConfirm = async (request, response) => {
	const { currentAppeal, params } = request;
	const { appealId } = currentAppeal;
	const { rule6PartyId } = params;

	try {
		await deleteRule6Party(request, rule6PartyId);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'rule6PartyRemoved',
			appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
