import logger from '#lib/logger.js';
import { changeLpaPage } from './local-planning-authority.mapper.js';
import { getLpaFromAppealId, getLpaList } from './local-planning-authority.service.js';

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
const renderChangeLpa = async (request, response) => {
	try {
		const { currentAppeal, apiClient, errors } = request;
		const { appealId } = currentAppeal;

		const lpaList = await getLpaList(apiClient);
		const currentLpa = await getLpaFromAppealId(apiClient, appealId);

		const mappedPageContent = changeLpaPage(currentAppeal, lpaList, currentLpa);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
