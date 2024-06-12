import { appealDetailsPage } from './appeal-details.mapper.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const viewAppealDetails = async (request, response) => {
	const appealDetails = request.currentAppeal;
	const session = request.session;

	if (appealDetails) {
		const currentUrl = request.originalUrl;
		const mappedPageContent = await appealDetailsPage(appealDetails, currentUrl, session);

		response.status(200).render('patterns/display-page.pattern.njk', {
			pageContent: mappedPageContent
		});
	} else {
		response.status(404).render('app/404.njk');
	}
};
