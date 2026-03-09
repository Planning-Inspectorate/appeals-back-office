/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const viewAccessibilityStatement = async (request, response) => {
	const backLinkUrl = request.headers.referer || '/appeals-service/all-cases';

	return response.render('app/accessibility-statement.njk', {
		backLinkUrl
	});
};
