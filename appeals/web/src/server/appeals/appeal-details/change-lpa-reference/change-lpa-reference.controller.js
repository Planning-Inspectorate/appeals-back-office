import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { changeLpaReferencePage } from './change-lpa-reference.mapper.js';
import { changeLpaReference } from './change-lpa-reference.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeLpaReference = async (request, response) => {
	return renderChangeLpaReference(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeLpaReference = async (request, response) => {
	try {
		const { errors } = request;
		const currentUrl = request.originalUrl;

		const origin = currentUrl.split('/').slice(0, -2).join('/');

		const appealDetails = request.currentAppeal;

		const mappedPageContents = changeLpaReferencePage(
			appealDetails,
			request.session.planningApplicationReference,
			origin,
			errors
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeLpaReference = async (request, response) => {
	request.session.planningApplicationReference = request.body['planningApplicationReference'];

	if (request.errors) {
		return renderChangeLpaReference(request, response);
	}

	const {
		params: { appealId }
	} = request;

	const currentUrl = request.originalUrl;

	const origin = currentUrl.split('/').slice(0, -2).join('/');

	try {
		await changeLpaReference(
			request.apiClient,
			appealId,
			request.session.planningApplicationReference
		);

		addNotificationBannerToSession(
			request.session,
			'lpaReferenceUpdated',
			appealId,
			`<p class="govuk-notification-banner__heading">LPA application reference updated</p>`
		);

		delete request.session.planningApplicationReference;

		return response.redirect(origin);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
