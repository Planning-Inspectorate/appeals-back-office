import { dateToDisplayDate, dayMonthYearToApiDateString, dateToDayMonthYear } from '#lib/dates.js';
import logger from '#lib/logger.js';
import {
	startCasePage,
	startCaseConfirmationPage,
	changeDatePage,
	changeDateConfirmationPage
} from './start-case.mapper.js';
import * as startCaseService from './start-case.service.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getStartDate = async (request, response) => {
	renderStartDatePage(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderStartDatePage = async (request, response) => {
	const { appealId, appealReference, startedAt } = request.currentAppeal;

	if (startedAt) {
		return response.status(500).render('app/500.njk');
	}

	const now = new Date();
	const today = dateToDisplayDate(now);

	const mappedPageContent = startCasePage(appealId, appealReference, today);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postStartDate = async (request, response) => {
	try {
		const { appealId } = request.currentAppeal;

		const today = new Date();
		const todayDayMonthYear = {
			day: today.getDate(),
			month: today.getMonth() + 1,
			year: today.getFullYear()
		};

		const todayApiDateString = dayMonthYearToApiDateString(todayDayMonthYear);

		await startCaseService.setStartDate(request.apiClient, appealId, todayApiDateString);

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/start-case/add/confirmation`
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when posting the case start date'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getAddConfirmation = async (request, response) => {
	const { appealId, appealReference } = request.currentAppeal;
	const pageContent = startCaseConfirmationPage(appealId, appealReference);

	response.status(200).render('appeals/confirmation.njk', {
		pageContent
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getChangeDate = async (request, response) => {
	renderChangeDatePage(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeDatePage = async (request, response) => {
	const { appealId, appealReference, startedAt, documentationSummary } = request.currentAppeal;

	if (!startedAt || documentationSummary?.lpaQuestionnaire?.status !== 'not_received') {
		return response.render('app/500.njk');
	}

	const now = new Date();
	const today = dateToDisplayDate(now);

	const mappedPageContent = changeDatePage(appealId, appealReference, today);

	return response.render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDate = async (request, response) => {
	try {
		const { appealId, documentationSummary } = request.currentAppeal;

		if (documentationSummary?.lpaQuestionnaire?.status !== 'not_received') {
			return response.render('app/500.njk');
		}

		const today = new Date();
		const todayDayMonthYear = dateToDayMonthYear(today);

		const todayApiDateString = dayMonthYearToApiDateString(todayDayMonthYear);

		await startCaseService.setStartDate(request.apiClient, appealId, todayApiDateString);

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/start-case/change/confirmation`
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when posting the case start date'
		);

		return response.render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getChangeConfirmation = async (request, response) => {
	const { appealId, appealReference } = request.currentAppeal;
	const pageContent = changeDateConfirmationPage(appealId, appealReference);

	response.render('appeals/confirmation.njk', {
		pageContent
	});
};
