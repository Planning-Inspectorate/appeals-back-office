import { dayMonthYearToApiDateString } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { decisionValidConfirmationPage, updateValidDatePage } from './outcome-valid.mapper.js';
import * as outcomeValidService from './outcome-valid.service.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getValidDate = async (request, response) => {
	renderValidDatePage(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postValidDate = async (request, response) => {
	const { errors, body } = request;

	if (errors) {
		return renderValidDatePage(request, response);
	}

	try {
		const updatedValidDateDay = parseInt(body['valid-date-day'], 10);
		const updatedValidDateMonth = parseInt(body['valid-date-month'], 10);
		const updatedValidDateYear = parseInt(body['valid-date-year'], 10);

		if (
			Number.isNaN(updatedValidDateDay) ||
			Number.isNaN(updatedValidDateMonth) ||
			Number.isNaN(updatedValidDateYear)
		) {
			let errorMessage = [{ msg: 'The valid date must be a valid date.' }];

			return renderValidDatePage(request, response, errorMessage);
		}

		const { appealId, appellantCaseId, createdAt } = request.session;
		const validDate = new Date(
			updatedValidDateYear,
			updatedValidDateMonth - 1,
			updatedValidDateDay
		);
		const receivedDate = new Date(createdAt).setHours(0, 0, 0, 0);

		if (validDate < new Date(receivedDate)) {
			let errorMessage = [
				{ msg: 'The valid date must be on or after the date the case was received.' }
			];

			return renderValidDatePage(request, response, errorMessage);
		}

		await outcomeValidService.setReviewOutcomeValidForAppellantCase(
			request.apiClient,
			appealId,
			appellantCaseId,
			dayMonthYearToApiDateString({
				day: updatedValidDateDay,
				month: updatedValidDateMonth,
				year: updatedValidDateYear
			})
		);

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/appellant-case/valid/confirmation`
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {object} [apiErrors]
 */
const renderValidDatePage = async (request, response, apiErrors) => {
	if (!objectContainsAllKeys(request.session, ['appealId', 'appealReference'])) {
		return response.render('app/500.njk');
	}
	const { appealId, appealReference } = request.session;

	let dateValidDay = request.body['valid-date-day'];
	let dateValidMonth = request.body['valid-date-month'];
	let dateValidYear = request.body['valid-date-year'];
	let errors = request.errors || apiErrors;

	const mappedPageContent = updateValidDatePage(
		appealId,
		appealReference,
		dateValidDay,
		dateValidMonth,
		dateValidYear
	);

	return response.render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getConfirmation = async (request, response) => {
	renderDecisionValidConfirmationPage(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderDecisionValidConfirmationPage = async (request, response) => {
	if (!objectContainsAllKeys(request.session, ['appealId', 'appealReference'])) {
		return response.render('app/500.njk');
	}

	const { appealId, appealReference } = request.session;
	const pageContent = decisionValidConfirmationPage(appealId, appealReference);

	response.render('appeals/confirmation.njk', {
		pageContent
	});
};
