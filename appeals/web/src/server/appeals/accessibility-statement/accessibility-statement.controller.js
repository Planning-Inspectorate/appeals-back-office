/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const viewAccessibilityStatement = async (request, response) => {
	let backLinkUrl =
		request.query.returnUrl || request.get('Referrer') || '/appeals-service/all-cases';

	if (
		typeof backLinkUrl !== 'string' ||
		!backLinkUrl.startsWith('/') ||
		backLinkUrl.startsWith('//')
	) {
		backLinkUrl = '/appeals-service/all-cases';
	}

	return response.render('app/accessibility-statement.njk', {
		backLinkUrl
	});
};
