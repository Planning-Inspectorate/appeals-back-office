import { changeAddressDetailsPage } from './change-appeal-address-details.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInquiryAddressDetails = async (request, response) => {
	const values = request.session['changeProcedureType'] || {};

	return renderInquiryAddressDetails(request, response, values, 'change');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('@pins/appeals').Address} values
 * @param {'setup' | 'change'} action
 */
export const renderInquiryAddressDetails = async (request, response, values, action) => {
	const { currentAppeal, errors } = request;

	const mappedPageContent = await changeAddressDetailsPage(currentAppeal, action, values, errors);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postInquiryAddressDetails = async (request, response) => {
	if (request.errors) {
		const values = request.session['changeProcedureType'] || {};
		return renderInquiryAddressDetails(request, response, values, 'change');
	}

	const { appealId, procedureType } = request.currentAppeal;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${procedureType.toLowerCase()}/change-timetable`
	);
};
