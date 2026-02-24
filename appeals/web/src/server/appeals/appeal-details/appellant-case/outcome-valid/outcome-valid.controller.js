import {
	dateISOStringToDayMonthYearHourMinute,
	dayMonthYearHourMinuteToISOString
} from '#lib/dates.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { isBefore } from 'date-fns';
import {
	checkAndConfirmEnforcementPage,
	updateEnforcementGroundAPage,
	updateEnforcementOtherInformationPage,
	updateEnforcementValidDatePage,
	updateValidDatePage
} from './outcome-valid.mapper.js';
import * as outcomeValidService from './outcome-valid.service.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getValidDate = async (request, response) => {
	return renderValidDatePage(request, response);
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
						path: 'all-fields',
						value: '',
						type: 'field',
						msg: 'The valid date must be a real date.'
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
						path: 'all-fields',
						value: '',
						type: 'field',
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
			// @ts-ignore
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

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getEnforcementGroundA = async (request, response) => {
	return renderEnforcementGroundA(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postEnforcementGroundA = async (request, response) => {
	const {
		errors,
		body,
		currentAppeal: { appealId },
		session
	} = request;

	if (errors) {
		return renderEnforcementGroundA(request, response);
	}

	try {
		const radioValue = body['enforcementGroundARadio'];

		session.webAppellantCaseReviewOutcome = {
			...session.webAppellantCaseReviewOutcome,
			outcome: 'valid',
			appealGroundABarred: radioValue
		};

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/appellant-case/valid/enforcement/other-information`
		);
	} catch (error) {
		logger.error(
			// @ts-ignore
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case ground (a) review'
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
const renderEnforcementGroundA = async (request, response, apiErrors) => {
	const { currentAppeal } = request;
	const errors = request.errors || apiErrors;
	const backLinkUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/`;

	const mappedPageContent = updateEnforcementGroundAPage(
		currentAppeal,
		backLinkUrl,
		request.session.webAppellantCaseReviewOutcome?.appealGroundABarred
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getEnforcementOtherInformation = async (request, response) => {
	return renderEnforcementOtherInformation(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postEnforcementOtherInformation = async (request, response) => {
	const {
		errors,
		body,
		currentAppeal: { appealId },
		currentAppeal,
		session
	} = request;

	if (errors) {
		return renderEnforcementOtherInformation(request, response);
	}

	try {
		const otherInformationValidRadio = body['otherInformationValidRadio'];
		const otherInformationDetails =
			otherInformationValidRadio === 'Yes' ? body['otherInformationDetails'] : undefined;
		session.webAppellantCaseReviewOutcome = {
			...session.webAppellantCaseReviewOutcome,
			otherInformationValidRadio,
			otherInformationDetails
		};

		if (request.route.path === '/enforcement-other-information') {
			const validationOutcome = session.webAppellantCaseReviewOutcome.validationOutcome;
			if (currentAppeal.appealType === APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING) {
				return response.redirect(
					`/appeals-service/appeal-details/${appealId}/appellant-case/incomplete/check-details`
				);
			} else {
				return response.redirect(
					`/appeals-service/appeal-details/${appealId}/appellant-case/${validationOutcome}/check-details-and-mark-enforcement-as-${validationOutcome}`
				);
			}
		}

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/appellant-case/valid/enforcement/date`
		);
	} catch (error) {
		logger.error(
			// @ts-ignore
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case ground (a) review'
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
const renderEnforcementOtherInformation = async (request, response, apiErrors) => {
	const {
		currentAppeal,
		session: { webAppellantCaseReviewOutcome },
		route: { path: routePath }
	} = request;
	const errors = request.errors || apiErrors;

	const mappedPageContent = updateEnforcementOtherInformationPage(
		currentAppeal,
		routePath,
		webAppellantCaseReviewOutcome?.otherInformationValidRadio,
		webAppellantCaseReviewOutcome?.otherInformationDetails,
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getEnforcementValidDate = async (request, response) => {
	return renderEnforcementValidDate(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postEnforcementValidDate = async (request, response) => {
	const { errors, body, currentAppeal, session } = request;

	if (errors) {
		return renderEnforcementValidDate(request, response);
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
			const /** @type {import('@pins/express').ValidationErrors} */ errorMessage = {
					'valid-date-day': {
						location: 'body',
						path: 'all-fields',
						value: '',
						type: 'field',
						msg: 'The valid date must be a real date.'
					}
				};

			return renderEnforcementValidDate(request, response, errorMessage);
		}

		session.webAppellantCaseReviewOutcome = {
			...session.webAppellantCaseReviewOutcome,
			updatedValidDateDay,
			updatedValidDateMonth,
			updatedValidDateYear
		};
		const { appealId } = currentAppeal;
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/appellant-case/valid/enforcement/check-details`
		);
	} catch (error) {
		logger.error(
			// @ts-ignore
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
const renderEnforcementValidDate = async (request, response, apiErrors) => {
	const {
		currentAppeal: { appealId, appealReference },
		session: { webAppellantCaseReviewOutcome }
	} = request;

	const dateValidDay =
		request.body['valid-date-day'] || webAppellantCaseReviewOutcome?.updatedValidDateDay;
	const dateValidMonth =
		request.body['valid-date-month'] || webAppellantCaseReviewOutcome?.updatedValidDateMonth;
	const dateValidYear =
		request.body['valid-date-year'] || webAppellantCaseReviewOutcome?.updatedValidDateYear;

	let errors = request.errors || apiErrors;

	const mappedPageContent = updateEnforcementValidDatePage(
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

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getEnforcementCheckDetails = async (request, response) => {
	return renderEnforcementCheckDetails(request, response, undefined);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postEnforcementCheckDetails = async (request, response) => {
	const { errors, currentAppeal, session } = request;

	if (errors) {
		return renderEnforcementCheckDetails(request, response);
	}

	try {
		const { appealId, appellantCaseId } = currentAppeal;
		const {
			webAppellantCaseReviewOutcome: {
				outcome,
				appealGroundABarred: appealGroundABarredString,
				otherInformationValidRadio,
				otherInformationDetails,
				updatedValidDateDay,
				updatedValidDateMonth,
				updatedValidDateYear
			}
		} = session;
		const appealGroundABarred = appealGroundABarredString === 'yes';

		await outcomeValidService.setReviewOutcomeValidForAppellantCase(
			request.apiClient,
			appealId,
			appellantCaseId,
			dayMonthYearHourMinuteToISOString({
				day: updatedValidDateDay,
				month: updatedValidDateMonth,
				year: updatedValidDateYear
			}),
			outcome,
			appealGroundABarred,
			otherInformationDetails ?? otherInformationValidRadio
		);

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'appealValidated',
			appealId
		});

		delete session.webAppellantCaseReviewOutcome;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(
			// @ts-ignore
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
const renderEnforcementCheckDetails = async (request, response, apiErrors) => {
	const mappedPageContent = checkAndConfirmEnforcementPage(request);
	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors: request.errors || apiErrors
	});
};
