import logger from '#lib/logger.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { selectProcedurePage } from './change-procedure-selection.mapper.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getSelectProcedure = async (request, response) => {
	await renderSelectProcedure(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderSelectProcedure = async (request, response) => {
	const {
		currentAppeal: { appealReference },
		params: { appealId },
		errors
	} = request;

	const sessionValues =
		request.session['changeProcedureType']?.[request.currentAppeal.appealId] || {};

	const mappedPageContent = selectProcedurePage(
		appealReference,
		request.query?.backUrl
			? String(request.query?.backUrl)
			: `/appeals-service/appeal-details/${appealId}`,
		sessionValues.appealProcedure,
		errors ? errors['appealProcedure']?.msg : undefined
	);

	return response.render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeSelectProcedure = async (request, response) => {
	try {
		const {
			errors,
			params: { appealId }
		} = request;

		if (errors) {
			return renderSelectProcedure(request, response);
		}

		const sessionValues =
			request.session['changeProcedureType']?.[request.currentAppeal.appealId] || {};
		const newProcedureType = sessionValues.appealProcedure;

		if (newProcedureType !== sessionValues.selectedProcedureType) {
			// Delete all dependent session values for the existing perocedure type
			delete sessionValues['dateKnown'];
			delete sessionValues['event-date-day'];
			delete sessionValues['event-date-month'];
			delete sessionValues['event-date-year'];
			delete sessionValues['event-time-hour'];
			delete sessionValues['event-time-minute'];
			delete sessionValues['estimationDays'];
			delete sessionValues['addressKnown'];
			delete sessionValues['addressLine1'];
			delete sessionValues['addressLine2'];
			delete sessionValues['estimationYesNo'];
			delete sessionValues['postCode'];
			delete sessionValues['town'];
			delete sessionValues['county'];
		}

		sessionValues.selectedProcedureType = newProcedureType;

		switch (newProcedureType) {
			case APPEAL_CASE_PROCEDURE.WRITTEN: {
				return response.redirect(
					`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/change-timetable`
				);
			}
			case APPEAL_CASE_PROCEDURE.HEARING: {
				return response.redirect(
					`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/change-event-date-known`
				);
			}
			case APPEAL_CASE_PROCEDURE.INQUIRY: {
				return response.redirect(
					`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/${newProcedureType}/date`
				);
			}
		}

		return response.status(404).render('app/404.njk');
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
