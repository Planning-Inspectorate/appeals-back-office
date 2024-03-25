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
		const updatedValidDateDay = parseInt(body['due-date-day'], 10);
		const updatedValidDateMonth = parseInt(body['due-date-month'], 10);
		const updatedValidDateYear = parseInt(body['due-date-year'], 10);

		if (
			Number.isNaN(updatedValidDateDay) ||
			Number.isNaN(updatedValidDateMonth) ||
			Number.isNaN(updatedValidDateYear)
		) {
			let errorMessage = [{ msg: 'The valid date must be a valid date.' }];

			return renderValidDatePage(request, response, errorMessage);
		}

		const reviewOutcome = 'valid';
		const { appealId } = request.session;
		const validDate = new Date(
			updatedValidDateYear,
			updatedValidDateMonth - 1,
			updatedValidDateDay
		);
		const receivedDate = new Date(request.session.createdAt);

		if (validDate < receivedDate) {
			let errorMessage = [
				{ msg: 'The valid date must be on or after the date the case was received.' }
			];

			return renderValidDatePage(request, response, errorMessage);
		}

		await outcomeValidService.setAppealValidDate(
			request.apiClient,
			appealId,
			dayMonthYearToApiDateString({
				day: updatedValidDateDay,
				month: updatedValidDateMonth,
				year: updatedValidDateYear
			})
		);

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/appellant-case/${reviewOutcome}/confirmation`
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

	const mappedPageContent = updateValidDatePage(appealId, appealReference);

	let errors = request.errors || apiErrors;

	return response.render('appeals/appeal/update-date.njk', {
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
