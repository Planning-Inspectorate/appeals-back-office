import { changeAddressKnownPage } from './change-appeal-address-known.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInquiryAddressKnown = async (request, response) => {
	return renderChangeInquiryAddressKnown(
		request,
		response,
		'change',
		request.session.setUpInquiry || {}
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {{addressKnown: string}} [values]
 * @param {'change' | 'setup'} action
 */
export const renderChangeInquiryAddressKnown = async (request, response, action, values) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	const mappedPageContent = await changeAddressKnownPage(appealDetails, action, values);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInquiryAddressKnown = async (request, response) => {
	if (request.errors) {
		return renderChangeInquiryAddressKnown(request, response, 'change');
	}

	const { appealId, procedureType } = request.currentAppeal;

	if (request.body.addressKnown === 'yes') {
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${procedureType.toLowerCase()}/address-details`
		);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${procedureType.toLowerCase()}/change-timetable`
	);
};
