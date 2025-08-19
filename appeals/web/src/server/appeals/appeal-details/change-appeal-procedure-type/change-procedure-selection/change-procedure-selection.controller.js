import logger from '#lib/logger.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { selectProcedurePage } from './change-procedure-selection.mapper.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getSelectProcedure = async (request, response) => {
	renderSelectProcedure(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderSelectProcedure = async (request, response) => {
	const {
		currentAppeal: { appealReference },
		session,
		errors
	} = request;

	const mappedPageContent = selectProcedurePage(
		appealReference,
		request.query?.backUrl ? String(request.query?.backUrl) : '/',
		session.changeProcedureType,
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
			session,
			body: { appealProcedure },
			params: { appealId }
		} = request;

		if (errors) {
			return renderSelectProcedure(request, response);
		}

		if (
			session.changeProcedureType.existingAppealProcedure.toLowerCase() ===
				APPEAL_CASE_PROCEDURE.WRITTEN &&
			appealProcedure === APPEAL_CASE_PROCEDURE.WRITTEN
		) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/change-appeal-procedure-type/change-timetable`
			);
		}

		return response.redirect('');
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
