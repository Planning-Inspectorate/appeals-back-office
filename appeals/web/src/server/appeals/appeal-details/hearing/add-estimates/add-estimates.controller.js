import { addEstimatesPage } from './add-estimates.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const redirectToEstimates = (request, response) => {
	const { currentAppeal } = request;
	response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/hearing/add-estimates/estimates`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getEstimates = async (request, response) => {
	return renderEstimates(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderEstimates = async (request, response) => {
	const { errors } = request;
	const appealDetails = request.currentAppeal;
	const sourceValues = request.session['addEstimates'] || {};

	const values = {
		preparationTime: sourceValues['preparation-time'] || '',
		sittingTime: sourceValues['sitting-time'] || '',
		reportingTime: sourceValues['reporting-time'] || ''
	};

	const mappedPageContent = await addEstimatesPage(appealDetails, values, errors);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postEstimates = async (request, response) => {
	if (request.errors) {
		return renderEstimates(request, response);
	}

	const { appealId } = request.currentAppeal;
	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/hearing/add-estimates/check-details`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckDetails = async (request, response) => {
	/// TODO: Not yet implemented
	return response.status(404).render('app/404.njk');
};
