import { estimationPage } from './change-procedure-estimation.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeEstimation = async (request, response) => {
	const sessionValues = request.session.changeProcedureType || {};
	return renderChangeEstimation(request, response, 'change', sessionValues);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {'change' | 'setup'} action
 * @param {{estimationYesNo: string, estimationDays: number}} [values]
 */
export const renderChangeEstimation = async (request, response, action, values) => {
	const { errors } = request;
	const appealDetails = request.currentAppeal;
	const newProcedureType = request.session.changeProcedureType.appealProcedure;

	const mappedPageContent = estimationPage(appealDetails, action, newProcedureType, errors, values);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeEstimation = async (request, response) => {
	const { appealId } = request.currentAppeal;
	const newProcedureType = request.session.changeProcedureType.appealProcedure;
	const sessionValues = request.session.changeProcedureType || {};

	if (request.errors) {
		return renderChangeEstimation(request, response, 'change', sessionValues || {});
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/address-known`
	);
};
