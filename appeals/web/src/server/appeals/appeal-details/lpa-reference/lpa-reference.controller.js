import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { changeLpaReferencePage } from './lpa-reference.mapper.js';
import { changeLpaReference } from './lpa-reference.service.js';

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

	const currentUrl = getOriginPathname(request);
	const origin = currentUrl.split('/').slice(0, -2).join('/');

	if (!isInternalUrl(origin, request)) {
		return response.status(400).render('errorPageTemplate', {
			message: 'Invalid redirection attempt detected.'
		});
	}

	try {
		await changeLpaReference(
			request.apiClient,
			appealId,
			request.session.planningApplicationReference
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: `LPA application reference updated`
		});

		delete request.session.planningApplicationReference;

		return response.redirect(origin);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
