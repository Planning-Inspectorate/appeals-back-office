import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { changeSafetyRisksPage } from './safety-risks.mapper.js';
import { changeAppellantSafetyRisks, changeLpaSafetyRisks } from './safety-risks.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeSafetyRisks = async (request, response) => {
	return renderChangeSafetyRisks(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeSafetyRisks = async (request, response) => {
	try {
		const {
			errors,
			params: { source }
		} = request;
		const currentUrl = request.originalUrl;
		const backLinkUrl = currentUrl.split('/').slice(0, -3).join('/');
		const appealData = request.currentAppeal;

		const mappedPageContents = changeSafetyRisksPage(
			appealData,
			request.session.safetyRisks,
			backLinkUrl,
			source
		);

		delete request.session.safetyRisks;

		return response.render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.safetyRisks;
		return response.render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeSafetyRisks = async (request, response) => {
	request.session.safetyRisks = {
		radio: request.body['safetyRisksRadio'],
		details: request.body['safetyRisksDetails']
	};

	if (request.errors) {
		return renderChangeSafetyRisks(request, response);
	}

	const {
		params: { appealId, source }
	} = request;
	const confirmRedirectURL = request.originalUrl.split('/').slice(0, -3).join('/');
	const appealData = request.currentAppeal;
	const formattedSource = source === 'lpa' ? 'LPA' : source;

	try {
		if (source === 'lpa') {
			await changeLpaSafetyRisks(
				request.apiClient,
				appealId,
				appealData.lpaQuestionnaireId,
				request.session.safetyRisks
			);
		} else {
			await changeAppellantSafetyRisks(
				request.apiClient,
				appealId,
				appealData.appellantCaseId,
				request.session.safetyRisks
			);
		}

		addNotificationBannerToSession(
			request.session,
			'siteHealthAndSafetyUpdated',
			appealId,
			`<p class="govuk-notification-banner__heading">Site health and safety risks (${formattedSource} answer) updated</p>`
		);

		delete request.session.safetyRisks;

		return response.redirect(confirmRedirectURL);
	} catch (error) {
		logger.error(error);
	}
	return response.render('app/500.njk');
};