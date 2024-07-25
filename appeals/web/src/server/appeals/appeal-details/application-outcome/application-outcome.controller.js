import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getAppellantCaseFromAppealId } from '../appellant-case/appellant-case.service.js';
import { changeApplicationOutcomeMapper } from './application-outcome.mapper.js';
import { changeApplicationOutcome } from './application-outcome.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getApplicationOutcome = async (request, response) => {
	return renderApplicationOutcome(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderApplicationOutcome = async (request, response) => {
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

			const mappedPageContents = changeApplicationOutcomeMapper(
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
export const postApplicationOutcome = async (request, response) => {
	request.session.applicationOutcome = {
		radio: request.body['applicationOutcomeRadio']
	};

	if (request.errors) {
		return renderApplicationOutcome(request, response);
	}

	const { appellantCaseId, appealId } = request.currentAppeal;
	console.log('🚀 ~ postApplicationOutcome ~ request.session:', request.session);

	try {
		await changeApplicationOutcome(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.applicationOutcome
		);

		addNotificationBannerToSession(
			request.session,
			'changePage',
			appealId,
			`<p class="govuk-notification-banner__heading">Application outcome updated</p>`
		);

		delete request.session.applicationOutcome;

		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
