import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { changeLpaPage } from './local-planning-authority.mapper.js';
import { getLpaList, postChangeLpaRequest } from './local-planning-authority.service.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeLpa = async (request, response) => {
	return renderChangeLpa(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeLpa = async (request, response) => {
	try {
		const { appealId } = request.params;
		const { localPlanningAuthority } = request.body;
		const { errors } = request;

		if (errors) {
			return renderChangeLpa(request, response);
		}

		await postChangeLpaRequest(request.apiClient, appealId, localPlanningAuthority);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'lpaChanged',
			appealId
		});

		const redirectUrl = generateBacklinkUrl(request.originalUrl);

		return response.redirect(redirectUrl);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeLpa = async (request, response) => {
	try {
		const { currentAppeal, apiClient, errors } = request;

		const lpaList = await getLpaList(apiClient);
		const backlinkUrl = generateBacklinkUrl(request.originalUrl);

		const mappedPageContent = changeLpaPage(currentAppeal, lpaList, backlinkUrl);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {string} currentUrl
 * @returns {string}
 */
const generateBacklinkUrl = (currentUrl) => {
	return currentUrl.split('/').slice(0, -2).join('/');
};
