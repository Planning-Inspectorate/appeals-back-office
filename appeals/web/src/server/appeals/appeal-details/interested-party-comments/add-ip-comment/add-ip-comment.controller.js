/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderStep(request, response) {
	const { step } = request.params;
	if (!step) {
		return response.redirect('./add/ip-details');
	}

	return response.status(200).render('patterns/display-page.pattern.njk');
}
