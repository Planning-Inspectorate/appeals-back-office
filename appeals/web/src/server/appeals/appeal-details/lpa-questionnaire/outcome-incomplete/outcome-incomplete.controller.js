import logger from '#lib/logger.js';
import * as lpaQuestionnaireService from '../lpa-questionnaire.service.js';
import {
	mapIncompleteReasonOptionsToCheckboxItemParameters,
	updateDueDatePage
} from '../lpa-questionnaire.mapper.js';
import { getLPAQuestionnaireIncompleteReasonOptions } from '../lpa-questionnaire.service.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { getNotValidReasonsTextFromRequestBody } from '#lib/validation-outcome-reasons-formatter.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderIncompleteReason = async (request, response) => {
	const {
		errors,
		body,
		session,
		currentAppeal,
		params: { lpaQuestionnaireId }
	} = request;

	const [lpaQuestionnaireResponse, incompleteReasonOptions] = await Promise.all([
		lpaQuestionnaireService.getLpaQuestionnaireFromId(
			request.apiClient,
			currentAppeal.appealId,
			lpaQuestionnaireId
		),
		getLPAQuestionnaireIncompleteReasonOptions(request.apiClient)
	]);

	if (!lpaQuestionnaireResponse) {
		return response.status(404).render('app/404.njk');
	}

	if (
		session.webLPAQuestionnaireReviewOutcome &&
		(session.webLPAQuestionnaireReviewOutcome.appealId !== currentAppeal.appealId ||
			session.webLPAQuestionnaireReviewOutcome.lpaQuestionnaireId !== lpaQuestionnaireId ||
			session.webLPAQuestionnaireReviewOutcome.validationOutcome !== 'incomplete')
	) {
		delete session.webLPAQuestionnaireReviewOutcome;
	}

	if (incompleteReasonOptions) {
		const mappedIncompleteReasonOptions = mapIncompleteReasonOptionsToCheckboxItemParameters(
			incompleteReasonOptions,
			body,
			session.webLPAQuestionnaireReviewOutcome,
			lpaQuestionnaireResponse.validation,
			errors
		);

		return response.status(200).render('appeals/appeal/lpa-questionnaire-incomplete.njk', {
			appeal: {
				id: currentAppeal.appealId,
				shortReference: appealShortReference(currentAppeal.appealReference)
			},
			lpaQuestionnaireId,
			reasonOptions: mappedIncompleteReasonOptions,
			errors
		});
	}

	return response.status(500).render('app/500.njk');
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderUpdateDueDate = async (request, response) => {
	const {
		body,
		currentAppeal,
		errors,
		params: { lpaQuestionnaireId }
	} = request;

	let dueDateDay, dueDateMonth, dueDateYear;

	if (request.session.webLPAQuestionnaireReviewOutcome?.updatedDueDate) {
		dueDateDay = request.session.webLPAQuestionnaireReviewOutcome?.updatedDueDate.day;
		dueDateMonth = request.session.webLPAQuestionnaireReviewOutcome?.updatedDueDate.month;
		dueDateYear = request.session.webLPAQuestionnaireReviewOutcome?.updatedDueDate.year;
	}

	if (objectContainsAllKeys(body, ['due-date-day', 'due-date-month', 'due-date-year'])) {
		dueDateDay = body['due-date-day'];
		dueDateMonth = body['due-date-month'];
		dueDateYear = body['due-date-year'];
	}

	const mappedPageContent = updateDueDatePage(
		currentAppeal,
		errors,
		lpaQuestionnaireId,
		dueDateDay,
		dueDateMonth,
		dueDateYear,
		!!errors
	);

	return response.status(200).render('appeals/appeal/update-date.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getIncompleteReason = async (request, response) => {
	renderIncompleteReason(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postIncompleteReason = async (request, response) => {
	const { errors, currentAppeal } = request;

	if (errors) {
		return renderIncompleteReason(request, response);
	}

	try {
		const {
			params: { lpaQuestionnaireId }
		} = request;

		/** @type {import('../lpa-questionnaire.types.js').LPAQuestionnaireSessionValidationOutcome} */
		request.session.webLPAQuestionnaireReviewOutcome = {
			appealId: currentAppeal.appealId,
			appealReference: currentAppeal.appealReference,
			lpaQuestionnaireId,
			validationOutcome: 'incomplete',
			reasons: request.body.incompleteReason,
			reasonsText: getNotValidReasonsTextFromRequestBody(request.body, 'incompleteReason')
		};

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${lpaQuestionnaireId}/incomplete/date`
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getUpdateDueDate = async (request, response) => {
	renderUpdateDueDate(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postUpdateDueDate = async (request, response) => {
	const {
		errors,
		body,
		session,
		currentAppeal,
		params: { lpaQuestionnaireId }
	} = request;

	if (!objectContainsAllKeys(session, 'webLPAQuestionnaireReviewOutcome')) {
		return response.status(500).render('app/500.njk');
	}

	if (errors) {
		return renderUpdateDueDate(request, response);
	}

	if (!objectContainsAllKeys(body, ['due-date-day', 'due-date-month', 'due-date-year'])) {
		return response.status(500).render('app/500.njk');
	}

	try {
		const updatedDueDateDay = parseInt(body['due-date-day'], 10);
		const updatedDueDateMonth = parseInt(body['due-date-month'], 10);
		const updatedDueDateYear = parseInt(body['due-date-year'], 10);

		if (
			Number.isNaN(updatedDueDateDay) ||
			Number.isNaN(updatedDueDateMonth) ||
			Number.isNaN(updatedDueDateYear)
		) {
			return response.status(500).render('app/500.njk');
		}

		request.session.webLPAQuestionnaireReviewOutcome.updatedDueDate = {
			day: updatedDueDateDay,
			month: updatedDueDateMonth,
			year: updatedDueDateYear
		};

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${lpaQuestionnaireId}/check-your-answers`
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.status(500).render('app/500.njk');
	}
};
