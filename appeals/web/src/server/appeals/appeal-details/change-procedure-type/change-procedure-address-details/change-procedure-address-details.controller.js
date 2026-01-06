import { getSessionValuesForAppeal } from '#lib/edit-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import { getBackLinkUrl } from '../change-procedure-type.controller.js';
import { changeAddressDetailsPage } from './change-procedure-address-details.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddressDetails = async (request, response) => {
	const {
		currentAppeal: { appealId }
	} = request;
	const sessionValues = getSessionValuesForAppeal(request, 'changeProcedureType', appealId);

	return renderAddressDetails(request, response, sessionValues);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {Record<string, string>} values
 */
export const renderAddressDetails = async (request, response, values) => {
	const { currentAppeal, errors } = request;
	const newProcedureType = values.appealProcedure;
	const backLinkUrl = getBackLinkUrl(request, `${newProcedureType}/address-known`);
	const mappedPageContent = changeAddressDetailsPage(currentAppeal, values, errors, backLinkUrl);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddressDetails = async (request, response) => {
	const { currentAppeal } = request;
	const sessionValues = getSessionValuesForAppeal(
		request,
		'changeProcedureType',
		currentAppeal.appealId
	);
	if (request.errors) {
		return renderAddressDetails(request, response, sessionValues);
	}
	const { appealId } = request.currentAppeal;
	const newProcedureType = sessionValues.appealProcedure;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/change-timetable`
		)
	);
};
