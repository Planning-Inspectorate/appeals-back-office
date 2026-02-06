import { getSessionValuesForAppeal } from '#lib/edit-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import { getBackLinkUrl } from '../change-procedure-type.controller.js';
import { changeAddressKnownPage } from './change-procedure-address-known.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInquiryAddressKnown = async (request, response) => {
	return renderChangeInquiryAddressKnown(
		request,
		response,
		getSessionValuesForAppeal(request, 'changeProcedureType', request.currentAppeal.appealId)
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {Record<string, string>} [values]
 */
export const renderChangeInquiryAddressKnown = async (request, response, values) => {
	const { errors } = request;
	const appealDetails = request.currentAppeal;
	const sessionValues = getSessionValuesForAppeal(
		request,
		'changeProcedureType',
		request.currentAppeal.appealId
	);
	const newProcedureType = sessionValues.appealProcedure;
	const backLinkUrl = getBackLinkUrl(request, `${newProcedureType}/estimation`);
	const mappedPageContent = changeAddressKnownPage(appealDetails, backLinkUrl, values);

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
		return renderChangeInquiryAddressKnown(request, response);
	}

	const { appealId } = request.params;
	const sessionValues = getSessionValuesForAppeal(request, 'changeProcedureType', appealId);
	const newProcedureType = sessionValues.appealProcedure;

	if (request.body.addressKnown === 'yes') {
		return response.redirect(
			preserveQueryString(
				request,
				`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/address-details`
			)
		);
	}

	delete sessionValues['addressLine1'];
	delete sessionValues['addressLine2'];
	delete sessionValues['town'];
	delete sessionValues['county'];
	delete sessionValues['postCode'];

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/change-timetable`
		)
	);
};
