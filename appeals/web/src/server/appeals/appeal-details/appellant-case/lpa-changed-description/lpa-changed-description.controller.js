import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeLPAChangedDescriptionMapper } from './lpa-changed-description.mapper.js';
import { changeLPAChangedDescription } from './lpa-changed-description.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getLPAChangedDescription = async (request, response) => {
	return renderLPAChangedDescription(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderLPAChangedDescription = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;
		const currentUrl = request.originalUrl;
		const backLinkUrl = currentUrl.split('/').slice(0, -3).join('/');

		if (currentAppeal?.appellantCaseId !== null && currentAppeal?.appellantCaseId !== undefined) {
			const appellantCaseResponse = await getAppellantCaseFromAppealId(
				request.apiClient,
				currentAppeal.appealId,
				currentAppeal.appellantCaseId
			).catch((error) => logger.error(error));

			const mappedPageContents = changeLPAChangedDescriptionMapper(
				appellantCaseResponse,
				request.session.lpaChangedDescription,
				backLinkUrl
			);

			delete request.session.lpaChangedDescription;

			return response.status(200).render('patterns/change-page.pattern.njk', {
				pageContent: mappedPageContents,
				errors
			});
		}

		return response.status(404).render('app/404.njk');
	} catch (error) {
		logger.error(error);
		delete request.session.lpaChangedDescription;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postLPAChangedDescription = async (request, response) => {
	request.session.lpaChangedDescription = {
		radio: request.body['lpaChangedDescriptionRadio']
	};

	if (request.errors) {
		return renderLPAChangedDescription(request, response);
	}

	const { appellantCaseId, appealId } = request.currentAppeal;

	try {
		await changeLPAChangedDescription(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.lpaChangedDescription
		);

		addNotificationBannerToSession(
			request.session,
			'changePage',
			appealId,
			`<p class="govuk-notification-banner__heading">LPA changed development description updated</p>`
		);

		delete request.session.lpaChangedDescription;

		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
