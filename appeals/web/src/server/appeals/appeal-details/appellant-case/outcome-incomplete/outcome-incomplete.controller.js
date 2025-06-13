import logger from '#lib/logger.js';
import {
	mapInvalidOrIncompleteReasonOptionsToCheckboxItemParameters,
	updateDueDatePage
} from '../appellant-case.mapper.js';
import * as appellantCaseService from '../appellant-case.service.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { getNotValidReasonsTextFromRequestBody } from '#lib/validation-outcome-reasons-formatter.js';
import {
	dateISOStringToDayMonthYearHourMinute,
	calculateIncompleteDueDate,
	getTodaysISOString
} from '#lib/dates.js';
import { isAfter, parseISO } from 'date-fns';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderIncompleteReason = async (request, response) => {
	const {
		errors,
		body,
		currentAppeal: { appealId, appealReference, appellantCaseId }
	} = request;

	if (appellantCaseId === null || appellantCaseId === undefined) {
		return response.status(404).render('app/404.njk');
	}

	const [appellantCaseResponse, incompleteReasonOptions] = await Promise.all([
		appellantCaseService
			.getAppellantCaseFromAppealId(request.apiClient, appealId, appellantCaseId)
			.catch((error) => logger.error(error)),
		appellantCaseService.getAppellantCaseNotValidReasonOptionsForOutcome(
			request.apiClient,
			'incomplete'
		)
	]);

	if (!appellantCaseResponse) {
		return response.status(404).render('app/404.njk');
	}

	if (
		request.session.webAppellantCaseReviewOutcome &&
		(request.session.webAppellantCaseReviewOutcome.appealId !== appealId ||
			request.session.webAppellantCaseReviewOutcome.validationOutcome !== 'incomplete')
	) {
		delete request.session.webAppellantCaseReviewOutcome;
	}

	const { webAppellantCaseReviewOutcome } = request.session;

	if (incompleteReasonOptions) {
		const mappedIncompleteReasonOptions =
			mapInvalidOrIncompleteReasonOptionsToCheckboxItemParameters(
				'incomplete',
				incompleteReasonOptions,
				body,
				webAppellantCaseReviewOutcome,
				appellantCaseResponse.validation
			);

		return response.status(200).render('appeals/appeal/appellant-case-invalid-incomplete.njk', {
			appeal: {
				id: appealId,
				shortReference: appealShortReference(appealReference)
			},
			notValidStatus: 'incomplete',
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
	const { body, currentAppeal, errors } = request;
	let dueDateDay, dueDateMonth, dueDateYear;

	if (request.session.webAppellantCaseReviewOutcome?.updatedDueDate) {
		dueDateDay = request.session.webAppellantCaseReviewOutcome.updatedDueDate.day;
		dueDateMonth = request.session.webAppellantCaseReviewOutcome.updatedDueDate.month;
		dueDateYear = request.session.webAppellantCaseReviewOutcome.updatedDueDate.year;
	} else {
		const appellantCase = await appellantCaseService
			.getAppellantCaseFromAppealId(
				request.apiClient,
				currentAppeal.appealId,
				currentAppeal.appellantCaseId
			)
			.catch((error) => logger.error(error));

		if (appellantCase?.applicationDecisionDate) {
			const defaultDueDate = calculateIncompleteDueDate(
				appellantCase.applicationDecisionDate,
				currentAppeal.appealType
			);

			if (defaultDueDate && isAfter(defaultDueDate, parseISO(getTodaysISOString()))) {
				const processedDueDate = dateISOStringToDayMonthYearHourMinute(
					defaultDueDate.toISOString()
				);

				dueDateDay = processedDueDate.day;
				dueDateMonth = processedDueDate.month;
				dueDateYear = processedDueDate.year;
			}
		}
	}
	if (objectContainsAllKeys(body, ['due-date-day', 'due-date-month', 'due-date-year'])) {
		dueDateDay = request.body['due-date-day'];
		dueDateMonth = request.body['due-date-month'];
		dueDateYear = request.body['due-date-year'];
	}

	const mappedPageContent = updateDueDatePage(
		currentAppeal,
		errors,
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
	const {
		errors,
		currentAppeal: { appealId }
	} = request;

	if (errors) {
		return renderIncompleteReason(request, response);
	}

	try {
		/** @type {import('../appellant-case.types.js').AppellantCaseSessionValidationOutcome} */
		request.session.webAppellantCaseReviewOutcome = {
			appealId,
			validationOutcome: 'incomplete',
			reasons: request.body.incompleteReason,
			reasonsText: getNotValidReasonsTextFromRequestBody(request.body, 'incompleteReason')
		};

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/appellant-case/incomplete/date`
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
	if (!objectContainsAllKeys(request.session, 'webAppellantCaseReviewOutcome')) {
		return response.status(500).render('app/500.njk');
	}

	const {
		body,
		currentAppeal: { appealId }
	} = request;

	if (!objectContainsAllKeys(body, ['due-date-day', 'due-date-month', 'due-date-year'])) {
		return response.status(500).render('app/500.njk');
	}

	if (request.errors) {
		return renderUpdateDueDate(request, response);
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

		request.session.webAppellantCaseReviewOutcome.updatedDueDate = {
			day: updatedDueDateDay,
			month: updatedDueDateMonth,
			year: updatedDueDateYear
		};

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/appellant-case/check-your-answers`
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
