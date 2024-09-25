import { isValid, isBefore, isAfter, startOfDay, parseISO } from 'date-fns';
import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { updateValidDatePage } from './outcome-valid.mapper.js';
import * as outcomeValidService from './outcome-valid.service.js';


/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getValidDate = async (request, response) => {
	renderValidDatePage(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postValidDate = async (request, response) => {
	const { errors, body, currentAppeal } = request;

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

		const { appealId, appellantCaseId, createdAt } = currentAppeal;
		const validDateISOString = dayMonthYearHourMinuteToISOString({
			year: updatedValidDateYear,
			month: updatedValidDateMonth,
			day: updatedValidDateDay
		});

		if (isBefore(new Date(validDateISOString), new Date(createdAt))) {
			let errorMessage = [
				{ msg: 'The valid date must be on or after the date the case was received.' }
			];

			return renderValidDatePage(request, response, errorMessage);
		}

		await outcomeValidService.setReviewOutcomeValidForAppellantCase(
			request.apiClient,
			appealId,
			appellantCaseId,
			dayMonthYearHourMinuteToISOString({
				day: updatedValidDateDay,
				month: updatedValidDateMonth,
				year: updatedValidDateYear
			})
		);

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
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

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {object} [apiErrors]
 */
const renderValidDatePage = async (request, response, apiErrors) => {
	const {
		currentAppeal: { appealId, appealReference }
	} = request;

	const dateValidDay = request.body['valid-date-day'];
	const dateValidMonth = request.body['valid-date-month'];
	const dateValidYear = request.body['valid-date-year'];

	let errors = request.errors || apiErrors;

	const mappedPageContent = updateValidDatePage(
		appealId,
		appealReference,
		dateValidDay,
		dateValidMonth,
		dateValidYear
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};
