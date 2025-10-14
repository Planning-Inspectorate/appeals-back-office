import { changeAddressKnownPage } from './change-procedure-address-known.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInquiryAddressKnown = async (request, response) => {
	return renderChangeInquiryAddressKnown(
		request,
		response,
		'change',
		request.session.changeProcedureType || {}
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
	const newProcedureType = request.session.changeProcedureType.appealProcedure;
	const mappedPageContent = changeAddressKnownPage(appealDetails, action, newProcedureType, values);

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

	const { appealId } = request.params;
	const newProcedureType = request.session.changeProcedureType.appealProcedure;

	console.log('known BODY!!!!!', request.body);
	console.log('known SESSION!!!!', request.session.changeProcedureType);

	if (request.body.addressKnown === 'yes') {
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/address-details`
		);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/change-timetable`
	);
};
