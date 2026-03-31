import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { removeNeighbouringSite } from '../../neighbouring-sites/neighbouring-sites.service.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { changeNeighbouringSiteAccessPage } from './neighbouring-site-access.mapper.js';
import { changeNeighbouringSiteAccess } from './neighbouring-site-access.service.js';
/**
 * @typedef {import('@pins/appeals.api').Appeals.NeighbouringSite} NeighbouringSite
 */

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeNeighbouringSiteAccess = async (request, response) => {
	return renderChangeNeighbouringSiteAccess(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeNeighbouringSiteAccess = async (request, response) => {
	const {
		errors,
		apiClient,
		params: { appealId, lpaQuestionnaireId },
		currentAppeal
	} = request;

	const lpaQuestionnaire = await getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId);

	const mappedPageContents = changeNeighbouringSiteAccessPage(
		currentAppeal,
		lpaQuestionnaire.reasonForNeighbourVisits,
		request.session.neighbouringSiteAccess?.radio,
		request.session.neighbouringSiteAccess?.details
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {'yes' | 'no'} neighbouringSiteAccess
 * @param {NeighbouringSite[]} neighbouringSites
 */
const createNextPageUrl = (
	request,
	appealId,
	lpaQuestionnaireId,
	neighbouringSiteAccess,
	neighbouringSites
) => {
	const lpaNeighbouringSites = neighbouringSites.filter((site) => site.source === 'lpa');

	if (neighbouringSiteAccess === 'yes' && lpaNeighbouringSites.length === 0) {
		const addNeighbouringSiteUrl = `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/neighbouring-sites/add/lpa`;
		const addNeighbouringSiteUrlBackLink = addBackLinkQueryToUrl(request, addNeighbouringSiteUrl);

		return addNeighbouringSiteUrlBackLink;
	}
	return `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`;
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeNeighbouringSiteAccess = async (request, response) => {
	request.session.neighbouringSiteAccess = {
		radio: request.body['neighbouringSiteAccessRadio'],
		details: request.body['neighbouringSiteAccess']
	};

	if (request.errors) {
		return renderChangeNeighbouringSiteAccess(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	try {
		await changeNeighbouringSiteAccess(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.neighbouringSiteAccess
		);

		if (request.session.neighbouringSiteAccess.radio === 'no') {
			const lpaNeighbouringSites = request.currentAppeal.neighbouringSites?.filter(
				(/** @type {NeighbouringSite} */ site) => site.source === 'lpa'
			);

			if (lpaNeighbouringSites?.length > 0) {
				await Promise.all(
					lpaNeighbouringSites.map((/** @type {NeighbouringSite} */ site) =>
						removeNeighbouringSite(apiClient, appealId, site.siteId.toString())
					)
				);
			}
		}

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Will the inspector need to enter a neighbour’s land or property updated'
		});

		const nextPageUrl = createNextPageUrl(
			request,
			appealId,
			lpaQuestionnaireId,
			request.session.neighbouringSiteAccess.radio,
			request.currentAppeal.neighbouringSites
		);

		delete request.session.neighbouringSiteAccess;

		return response.redirect(nextPageUrl);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
