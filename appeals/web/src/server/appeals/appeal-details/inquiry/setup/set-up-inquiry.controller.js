import {
	dateISOStringToDayMonthYearHourMinute,
	dayMonthYearHourMinuteToISOString,
	getTodaysISOString
} from '#lib/dates.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { isEmpty, isEqual, pick } from 'lodash-es';
import { createInquiry, updateInquiry } from './inquiry.service.js';
import {
	addressDetailsPage,
	addressKnownPage,
	confirmChangeInquiryPage,
	confirmInquiryPage,
	inquiryDatePage,
	inquiryDueDatesPage,
	inquiryEstimationPage
} from './set-up-inquiry.mapper.js';

/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {string} path
 * @param {string} sessionKey
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const redirectAndClearSession = (path, sessionKey) => (request, response) => {
	delete request.session[sessionKey];

	response.redirect(`${request.baseUrl}${path}`);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {NextFunction} next
 */
export const updateInquirySession = (request, response, next) => {
	const sessionValues = request.session.changeInquiry || {};
	const appealDetails = request.currentAppeal;

	const inquiryDate = dateISOStringToDayMonthYearHourMinute(
		request.currentAppeal.inquiry.inquiryStartTime
	);
	sessionValues['inquiry-date-day'] = sessionValues['inquiry-date-day'] ?? inquiryDate.day;
	sessionValues['inquiry-date-month'] = sessionValues['inquiry-date-month'] ?? inquiryDate.month;
	sessionValues['inquiry-date-year'] = sessionValues['inquiry-date-year'] ?? inquiryDate.year;
	sessionValues['inquiry-time-hour'] = sessionValues['inquiry-time-hour'] ?? inquiryDate.hour;
	sessionValues['inquiry-time-minute'] = sessionValues['inquiry-time-minute'] ?? inquiryDate.minute;

	sessionValues['inquiryEstimationYesNo'] =
		sessionValues['inquiryEstimationYesNo'] === undefined
			? request.currentAppeal.inquiry.estimatedDays
				? 'yes'
				: 'no'
			: sessionValues['inquiryEstimationYesNo'];

	sessionValues['inquiryEstimationDays'] =
		sessionValues['inquiryEstimationYesNo'] === 'yes'
			? sessionValues['inquiryEstimationDays'] ?? request.currentAppeal.inquiry.estimatedDays
			: undefined;

	sessionValues['addressKnown'] =
		sessionValues['addressKnown'] === undefined
			? appealDetails.inquiry?.address
				? 'yes'
				: 'no'
			: sessionValues['addressKnown'];
	const existingAddressValues = pick(sessionValues, [
		'addressLine1',
		'addressLine2',
		'town',
		'county',
		'postCode'
	]);
	const addressValues =
		sessionValues['addressKnown'] === 'no'
			? pick([], ['addressLine1', 'addressLine2', 'town', 'county', 'postCode'])
			: isEmpty(existingAddressValues)
			? {
					...pick(appealDetails.inquiry.address, [
						'addressLine1',
						'addressLine2',
						'town',
						'county'
					]),
					postCode: appealDetails.inquiry.address ? appealDetails.inquiry.address['postcode'] : null
			  }
			: existingAddressValues;

	request.session.changeInquiry = { ...sessionValues, ...addressValues };

	next();
};

/**
 * @param {{'inquiry-date-day': string, 'inquiry-date-month': string, 'inquiry-date-year': string, 'inquiry-time-hour': string, 'inquiry-time-minute': string}} sessionValues
 * @returns {{day: string, month: string, year: string, hour: string, minute: string}}
 */
const sessionValuesToDateTime = (sessionValues) => {
	return {
		day: sessionValues['inquiry-date-day'] || '',
		month: sessionValues['inquiry-date-month'] || '',
		year: sessionValues['inquiry-date-year'] || '',
		hour: sessionValues['inquiry-time-hour'] || '',
		minute: sessionValues['inquiry-time-minute'] || ''
	};
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInquiryDate = async (request, response) => {
	const sessionValues = request.session['setUpInquiry'] || {};

	return renderInquiryDate(request, response, 'setup', sessionValuesToDateTime(sessionValues));
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInquiryDate = async (request, response) => {
	const sessionValues = request.session['changeInquiry'] || {};
	return renderInquiryDate(request, response, 'change', sessionValuesToDateTime(sessionValues));
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {'change' | 'setup'} action
 * @param {{day?: string | number, month?: string | number, year?: string | number, hour?: string | number, minute?: string | number}} values
 */
export const renderInquiryDate = async (request, response, action, values) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	const mappedPageContent = await inquiryDatePage(appealDetails, values, action);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postInquiryDate = async (request, response) => {
	if (request.errors) {
		return renderInquiryDate(
			request,
			response,
			'setup',
			sessionValuesToDateTime(request.session['setUpInquiry'] || {})
		);
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(`/appeals-service/appeal-details/${appealId}/inquiry/setup/estimation`);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInquiryDate = async (request, response) => {
	if (request.errors) {
		return renderInquiryDate(
			request,
			response,
			'change',
			sessionValuesToDateTime(request.session['changeInquiry'] || {})
		);
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(`/appeals-service/appeal-details/${appealId}/inquiry/change/estimation`);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInquiryEstimation = async (request, response) => {
	return renderInquiryEstimation(request, response, 'setup');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInquiryEstimation = async (request, response) => {
	const sessionValues = request.session.changeInquiry || {};
	return renderInquiryEstimation(request, response, 'change', sessionValues);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {'change' | 'setup'} action
 * @param {{inquiryEstimationYesNo: string, inquiryEstimationDays: number}} [values]
 */
export const renderInquiryEstimation = async (request, response, action, values) => {
	const { errors } = request;
	const appealDetails = request.currentAppeal;

	const mappedPageContent = inquiryEstimationPage(appealDetails, action, errors, values);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postInquiryEstimation = async (request, response) => {
	if (request.errors) {
		const sessionValues = request.session.setUpInquiry || {};

		return renderInquiryEstimation(request, response, 'setup', sessionValues);
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(`/appeals-service/appeal-details/${appealId}/inquiry/setup/address`);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInquiryEstimation = async (request, response) => {
	if (request.errors) {
		return renderInquiryEstimation(request, response, 'change');
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(`/appeals-service/appeal-details/${appealId}/inquiry/change/address`);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInquiryAddress = async (request, response) => {
	return renderInquiryAddress(request, response, 'setup', request.session.setUpInquiry || {});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {{addressKnown: string}} [values]
 * @param {'change' | 'setup'} action
 */
export const renderInquiryAddress = async (request, response, action, values) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	const mappedPageContent = await addressKnownPage(appealDetails, action, values);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postInquiryAddress = async (request, response) => {
	if (request.errors) {
		return renderInquiryAddress(request, response, 'setup');
	}

	const { appealId } = request.currentAppeal;

	if (request.body.addressKnown === 'yes') {
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/inquiry/setup/address-details`
		);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/inquiry/setup/timetable-due-dates`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInquiryAddressDetails = async (request, response) => {
	const values = request.session['setUpInquiry'] || {};

	return renderInquiryAddressDetails(request, response, values, 'setup');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('@pins/appeals').Address} values
 * @param {'setup' | 'change'} action
 */
export const renderInquiryAddressDetails = async (request, response, values, action) => {
	const { currentAppeal, errors } = request;

	const mappedPageContent = await addressDetailsPage(currentAppeal, action, values, errors);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postInquiryAddressDetails = async (request, response) => {
	if (request.errors) {
		const values = request.session['setUpInquiry'] || {};
		return renderInquiryAddressDetails(request, response, values, 'setup');
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/inquiry/setup/timetable-due-dates`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInquiryDueDates = async (request, response) => {
	const values = request.session['setUpInquiry'] || {};

	return renderInquiryDueDates(request, response, 'setup', values);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInquiryDueDates = async (request, response) => {
	const values = request.session['changeInquiry'] || {};
	return renderInquiryDueDates(request, response, 'change', values);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {any} [values]
 * @param {'change' | 'setup'} action
 */
export const renderInquiryDueDates = async (request, response, action, values) => {
	const { currentAppeal, errors } = request;
	const mappedPageContent = await inquiryDueDatesPage(currentAppeal, values, action, errors);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postInquiryDueDates = async (request, response) => {
	if (request.errors) {
		const values = request.session['setUpInquiry'] || {};
		return renderInquiryDueDates(request, response, 'setup', values);
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/inquiry/setup/check-details`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInquiryDueDates = async (request, response) => {
	if (request.errors) {
		const values = request.session['changeInquiry'] || {};
		return renderInquiryDueDates(request, response, 'change', values);
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/inquiry/change/check-details`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInquiryAddress = async (request, response) => {
	const sessionValues = request.session.changeInquiry || {};
	return renderInquiryAddress(request, response, 'change', sessionValues);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInquiryAddress = async (request, response) => {
	if (request.errors) {
		return renderInquiryAddress(request, response, 'change');
	}

	const { appealId } = request.currentAppeal;

	if (request.body.addressKnown === 'yes') {
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/inquiry/change/address-details`
		);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/inquiry/change/check-details`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInquiryAddressDetails = async (request, response) => {
	const inquiry = request.session['changeInquiry'] || {};

	const address = {
		...pick(inquiry, ['addressLine1', 'addressLine2', 'town', 'county', 'postCode'])
	};
	return renderInquiryAddressDetails(request, response, address, 'change');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInquiryAddressDetails = async (request, response) => {
	if (request.errors) {
		const values = request.session['changeInquiry'] || {};
		return renderInquiryAddressDetails(request, response, values, 'change');
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/inquiry/change/check-details`
	);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInquiryCheckDetails = async (request, response) => {
	const {
		currentAppeal: { appealId, appealReference },
		session,
		errors
	} = request;

	if (!session.startCaseAppealProcedure?.[appealId]?.appealProcedure) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = confirmInquiryPage(appealId, appealReference, 'setup', session);

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
export const getChangeInquiryCheckDetails = async (request, response) => {
	const {
		currentAppeal: { appealId, appealReference },
		session,
		errors
	} = request;

	if (!request.session.changeInquiry) {
		return renderAlreadySubmittedError(request, response);
	}

	const mappedPageContent = confirmChangeInquiryPage(appealId, appealReference, 'change', session);

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
export const postInquiryCheckDetails = async (request, response) => {
	try {
		const {
			currentAppeal: { appealId }
		} = request;

		const { session } = request;
		const inquiry = session.setUpInquiry;

		if (!inquiry) {
			return renderAlreadySubmittedError(request, response);
		}

		if (!session.startCaseAppealProcedure?.[appealId]?.appealProcedure) {
			return response.status(500).render('app/500.njk');
		}

		// Create Inquiry
		await createInquiry(request, {
			...buildInquiryRequest(inquiry),
			startDate: getTodaysISOString()
		});

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'caseStarted',
			appealId
		});

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'timetableStarted',
			appealId
		});

		delete request.session.setUpInquiry;
		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when posting the check details and start case page'
		);

		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInquiryCheckDetails = async (request, response) => {
	try {
		const {
			currentAppeal: { appealId }
		} = request;

		const { session } = request;
		const inquiry = session.changeInquiry;

		if (!inquiry) {
			return renderAlreadySubmittedError(request, response);
		}

		// Update Inquiry
		await updateInquiry(request, buildChangeInquiryRequest(inquiry, request.currentAppeal));

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'inquiryUpdated',
			appealId
		});

		delete request.session.changeInquiry;
		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when posting the check details and start case page'
		);

		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {any} inquiry
 *
 * @returns {{estimatedDays?: string, inquiryStartTime: string, lpaQuestionnaireDueDate: string, statementDueDate: string, ipCommentsDueDate: string, statementOfCommonGroundDueDate: string, proofOfEvidenceAndWitnessesDueDate: string, planningObligationDueDate: string, address?: {addressLine1: string, addressLine2?: string, town: string, county?: string, postcode: string}}}
 */
const buildInquiryRequest = (inquiry) => {
	const submittedAddress = {
		address: {
			...pick(inquiry, ['addressLine1', 'addressLine2', 'town', 'county']),
			postcode: inquiry['postCode']
		}
	};

	return {
		inquiryStartTime: dayMonthYearHourMinuteToISOString({
			day: inquiry['inquiry-date-day'],
			month: inquiry['inquiry-date-month'],
			year: inquiry['inquiry-date-year'],
			hour: inquiry['inquiry-time-hour'],
			minute: inquiry['inquiry-time-minute']
		}),
		...(inquiry.addressKnown === 'yes' && submittedAddress),
		...(inquiry.inquiryEstimationYesNo === 'yes' && {
			estimatedDays: inquiry.inquiryEstimationDays
		}),
		lpaQuestionnaireDueDate: dayMonthYearHourMinuteToISOString({
			day: inquiry['lpa-questionnaire-due-date-day'],
			month: inquiry['lpa-questionnaire-due-date-month'],
			year: inquiry['lpa-questionnaire-due-date-year']
		}),
		statementDueDate: dayMonthYearHourMinuteToISOString({
			day: inquiry['statement-due-date-day'],
			month: inquiry['statement-due-date-month'],
			year: inquiry['statement-due-date-year']
		}),
		ipCommentsDueDate: dayMonthYearHourMinuteToISOString({
			day: inquiry['ip-comments-due-date-day'],
			month: inquiry['ip-comments-due-date-month'],
			year: inquiry['ip-comments-due-date-year']
		}),
		statementOfCommonGroundDueDate: dayMonthYearHourMinuteToISOString({
			day: inquiry['statement-of-common-ground-due-date-day'],
			month: inquiry['statement-of-common-ground-due-date-month'],
			year: inquiry['statement-of-common-ground-due-date-year']
		}),
		proofOfEvidenceAndWitnessesDueDate: dayMonthYearHourMinuteToISOString({
			day: inquiry['inquiry-date-day'],
			month: inquiry['inquiry-date-month'],
			year: inquiry['inquiry-date-year']
		}),
		planningObligationDueDate: dayMonthYearHourMinuteToISOString({
			day: inquiry['planning-obligation-due-date-day'],
			month: inquiry['planning-obligation-due-date-month'],
			year: inquiry['planning-obligation-due-date-year']
		})
	};
};

/**
 * @param {any} inquiry
 * @param {any} currentAppeal
 * @returns {{estimatedDays?: string, addressId?: number, inquiryStartTime: string, address?: {addressLine1: string, addressLine2?: string, town: string, county?: string, postcode: string}  | null}}
 */
const buildChangeInquiryRequest = (inquiry, currentAppeal) => {
	const submittedAddress = {
		...pick(inquiry, ['addressLine1', 'addressLine2', 'town', 'county']),
		postcode: inquiry['postCode']
	};
	let address;
	if (inquiry.addressKnown === 'no') {
		address = null;
	} else if (!isEqual(submittedAddress, currentAppeal.inquiry.address)) {
		address = submittedAddress;
	}

	return {
		inquiryStartTime: dayMonthYearHourMinuteToISOString({
			day: inquiry['inquiry-date-day'],
			month: inquiry['inquiry-date-month'],
			year: inquiry['inquiry-date-year'],
			hour: inquiry['inquiry-time-hour'],
			minute: inquiry['inquiry-time-minute']
		}),
		...(inquiry.addressKnown === 'yes' && { addressId: currentAppeal?.inquiry.addressId }),
		address,
		...(inquiry.inquiryEstimationYesNo === 'yes' && {
			estimatedDays: inquiry.inquiryEstimationDays
		})
	};
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAlreadySubmittedError = (request, response) => {
	return response.status(404).render('app/404.njk', {
		titleCopy: 'You cannot check these answers',
		bodyCopy: [
			'It looks like you may have already submitted the data.',
			`Continue to <a class="govuk-link" href="/appeals-service/appeal-details/${request.currentAppeal.appealId}">appeal details</a>`
		]
	});
};
