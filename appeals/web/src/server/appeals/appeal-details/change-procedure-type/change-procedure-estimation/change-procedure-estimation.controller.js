import { getSessionValuesForAppeal } from '#lib/edit-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import { getBackLinkUrl } from '../change-procedure-type.controller.js';
import { estimationPage } from './change-procedure-estimation.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeEstimation = async (request, response) => {
	const {
		currentAppeal: { appealId }
	} = request;
	const sessionValues = getSessionValuesForAppeal(request, 'changeProcedureType', appealId);
	return renderChangeEstimation(request, response, 'change', sessionValues);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {'change' | 'setup'} action
 * @param {Record<string, string>} [values]
 */
export const renderChangeEstimation = async (request, response, action, values) => {
	const { errors } = request;
	const appealDetails = request.currentAppeal;
	const sessionValues = getSessionValuesForAppeal(
		request,
		'changeProcedureType',
		appealDetails.appealId
	);
	const newProcedureType = sessionValues.appealProcedure;
	const backLinkUrl = getBackLinkUrl(request, `${newProcedureType}/date`);

	const mappedPageContent = estimationPage(appealDetails, action, backLinkUrl, errors, values);

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
	const sessionValues = getSessionValuesForAppeal(request, 'changeProcedureType', appealId);
	const newProcedureType = sessionValues.appealProcedure;

	if (request.errors) {
		return renderChangeEstimation(request, response, 'change', sessionValues || {});
	}

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/address-known`
		)
	);
};
