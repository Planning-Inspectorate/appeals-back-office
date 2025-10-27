import { changeAddressDetailsPage } from './change-procedure-address-details.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddressDetails = async (request, response) => {
	const sessionValues =
		request.session['changeProcedureType']?.[request.currentAppeal.appealId] || {};

	return renderAddressDetails(request, response, sessionValues, 'change');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('@pins/appeals').Address} values
 * @param {'setup' | 'change'} action
 */
export const renderAddressDetails = async (request, response, values, action) => {
	const { currentAppeal, errors } = request;
	const sessionValues =
		request.session['changeProcedureType']?.[request.currentAppeal.appealId] || {};
	const newProcedureType = sessionValues.appealProcedure;
	const mappedPageContent = changeAddressDetailsPage(
		currentAppeal,
		action,
		values,
		errors,
		newProcedureType
	);

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
	const sessionValues =
		request.session['changeProcedureType']?.[request.currentAppeal.appealId] || {};
	if (request.errors) {
		return renderAddressDetails(request, response, sessionValues, 'change');
	}
	const { appealId } = request.currentAppeal;
	const newProcedureType = sessionValues.appealProcedure;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/change-timetable`
	);
};
