import { isBefore } from 'date-fns';
import {
	dayMonthYearHourMinuteToISOString,
	dateISOStringToDayMonthYearHourMinute
} from '#lib/dates.js';
import logger from '#lib/logger.js';
import { updateValidDatePage } from './outcome-valid.mapper.js';
import * as outcomeValidService from './outcome-valid.service.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getValidDate = async (request, response) => {
	renderValidDatePage(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postValidDate = async (request, response) => {
	const { errors, body, currentAppeal, session } = request;

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
			let /** @type {import('@pins/express').ValidationErrors} */ errorMessage = {
					'valid-date-day': {
						location: 'body',
						param: 'all-fields',
						value: '',
						msg: 'The valid date must be a valid date.'
					}
				};

			return renderValidDatePage(request, response, errorMessage);
		}

		const { appealId, appellantCaseId, createdAt } = currentAppeal;
		const validDateISOString = dayMonthYearHourMinuteToISOString({
			year: updatedValidDateYear,
			month: updatedValidDateMonth,
			day: updatedValidDateDay
		});

		const {
			day: createdAtDay,
			month: createdAtMonth,
			year: createdAtYear
		} = dateISOStringToDayMonthYearHourMinute(createdAt);
		const createdAtDateAtMidnight = dayMonthYearHourMinuteToISOString({
			day: createdAtDay,
			month: createdAtMonth,
			year: createdAtYear
		});

		if (isBefore(new Date(validDateISOString), new Date(createdAtDateAtMidnight))) {
			let /** @type {import('@pins/express').ValidationErrors} */ errorMessage = {
					'valid-date-day': {
						location: 'body',
						param: 'all-fields',
						value: '',
						msg: 'The valid date must be on or after the date the case was received.'
					}
				};

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

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'appealValidated',
			appealId
		});

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
 * @param {import('@pins/express').ValidationErrors} [apiErrors]
 */
const renderValidDatePage = async (request, response, apiErrors) => {
	const {
		currentAppeal: { appealId, appealReference, createdAt }
	} = request;

	const createdDayMonthYear = dateISOStringToDayMonthYearHourMinute(createdAt);
	const dateValidDay = request.body['valid-date-day'] || createdDayMonthYear.day;
	const dateValidMonth = request.body['valid-date-month'] || createdDayMonthYear.month;
	const dateValidYear = request.body['valid-date-year'] || createdDayMonthYear.year;

	let errors = request.errors || apiErrors;

	const mappedPageContent = updateValidDatePage(
		appealId,
		appealReference,
		dateValidDay,
		dateValidMonth,
		dateValidYear,
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};
