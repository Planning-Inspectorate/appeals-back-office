import { errorFileTypesDoNotMatchPage } from './error.mapper.js';

/** @typedef {import('@pins/appeals').Pagination} Pagination */

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const viewError = async (request, response) => {
	const { errorType, backUrl } = request.query;

	if (errorType && errorType === 'fileTypesDoNotMatch') {
		return response.status(500).render('patterns/display-page.pattern.njk', {
			pageContent: errorFileTypesDoNotMatchPage(backUrl ? String(backUrl) : '/')
		});
	} else {
		return response.status(500).render('app/500.njk');
	}
};
