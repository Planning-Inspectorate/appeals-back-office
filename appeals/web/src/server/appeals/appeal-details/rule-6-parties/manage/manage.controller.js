import { manageRule6PartiesPage } from './manage.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getManageRule6Parties = async (request, response) => {
	const { currentAppeal } = request;

	const mappedPageContent = manageRule6PartiesPage(currentAppeal, request);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};
