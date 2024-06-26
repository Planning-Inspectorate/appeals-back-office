import { getAppealDetailsFromId } from '#appeals/appeal-details/appeal-details.service.js';
import { getLpaQuestionnaireFromId } from '#appeals/appeal-details/lpa-questionnaire/lpa-questionnaire.service.js';
import logger from '#lib/logger.js';
import { lpaQuestionnaireChangePage } from './change-page.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangePage = async (request, response) => {
	try {
		const currentUrl = request.originalUrl;
		const currentUrlFragments = currentUrl.split('/').filter((fragment) => fragment.length > 0);
		const origin = currentUrlFragments[currentUrlFragments.length - 2];
		const appealId = request.params.appealId;
		const appealData =
			request.currentAppeal ?? (await getAppealDetailsFromId(request.apiClient, appealId));
		let mappedPageContent;

		switch (origin) {
			case 'change-lpa-questionnaire': {
				const lpaqData = await getLpaQuestionnaireFromId(
					request.apiClient,
					request.params.appealId,
					request.params.lpaQuestionnaireId
				);
				mappedPageContent = lpaQuestionnaireChangePage(
					request.params.question,
					appealData,
					lpaqData,
					request.session,
					currentUrl
				);

				break;
			}
			default:
				return response.status(500).render('app/500.njk');
		}

		if (mappedPageContent === undefined) {
			return response.status(404).render('app/404.njk');
		} else {
			return response.status(200).render('patterns/change-page.pattern.njk', {
				pageContent: mappedPageContent
			});
		}
	} catch (error) {
		logger.error(error);
		return response.status(404).render('app/404.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangePage = async (request, response) => {
	renderChangePage(request, response);
};
