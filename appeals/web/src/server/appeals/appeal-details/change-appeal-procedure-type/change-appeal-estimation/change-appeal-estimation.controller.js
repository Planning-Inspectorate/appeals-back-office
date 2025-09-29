import { inquiryEstimationPage } from './change-appeal-estimation.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInquiryEstimation = async (request, response) => {
	const sessionValues = request.session.changeInquiry || {};
	return renderChangeInquiryEstimation(request, response, 'change', sessionValues);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {'change' | 'setup'} action
 * @param {{inquiryEstimationYesNo: string, inquiryEstimationDays: number}} [values]
 */
export const renderChangeInquiryEstimation = async (request, response, action, values) => {
	const { errors } = request;
	const appealDetails = request.currentAppeal;

	const mappedPageContent = inquiryEstimationPage(appealDetails, action, errors, values);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInquiryEstimation = async (request, response) => {
	if (request.errors) {
		const sessionValues = request.session.changeInquiry || {};

		return renderChangeInquiryEstimation(request, response, 'change', sessionValues);
	}

	const { appealId, procedureType } = request.currentAppeal;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${procedureType.toLowerCase()}/address-known`
	);
};
