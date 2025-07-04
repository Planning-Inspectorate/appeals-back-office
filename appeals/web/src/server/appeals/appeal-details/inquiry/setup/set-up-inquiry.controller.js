import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	inquiryDatePage,
	addressDetailsPage,
	addressKnownPage,
	inquiryDueDatesPage
	confirmInquiryPage
} from './set-up-inquiry.mapper.js';
import { inquiryEstimationPage } from './set-up-inquiry.mapper.js';
import { isEmpty, has, pick } from 'lodash-es';
import { dayMonthYearHourMinuteToISOString, getTodaysISOString } from '#lib/dates.js';
import logger from '#lib/logger.js';
import * as startCaseService from '../../start-case/start-case.service.js';
import { createInquiry, createInquiryEstimates } from './inquiry.service.js';

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

	return renderInquiryDate(request, response, sessionValuesToDateTime(sessionValues));
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {{day?: string | number, month?: string | number, year?: string | number, hour?: string | number, minute?: string | number}} values
 */
export const renderInquiryDate = async (request, response, values) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	const mappedPageContent = await inquiryDatePage(appealDetails, values);

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
export const getInquiryEstimation = async (request, response) => {
	return renderInquiryEstimation(request, response, 'setup');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {'change' | 'setup'} action
 */
export const renderInquiryEstimation = async (request, response, action) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	const mappedPageContent = await inquiryEstimationPage(appealDetails, action);

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
		return renderInquiryEstimation(request, response, 'setup');
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(`/appeals-service/appeal-details/${appealId}/inquiry/setup/address`);
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

	return renderInquiryDueDates(request, response, values);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('@pins/appeals').Address} values
 */
export const renderInquiryDueDates = async (request, response, values) => {
	const { currentAppeal, errors } = request;
	const sessionValues = request.session['setUpInquiry'] || {};
	const mappedPageContent = await inquiryDueDatesPage(currentAppeal, sessionValues, values, errors);

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
		return renderInquiryDueDates(request, response, values);
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
export const getChangeInquiryAddress = async (request, response) => {
	const appealDetails = request.currentAppeal;
	const sessionValues = request.session.changeInquiry || {};

	const values = has(sessionValues, 'addressKnown')
		? sessionValues
		: { addressKnown: appealDetails.inquiry?.address ? 'yes' : 'no' };

	return renderInquiryAddress(request, response, 'change', values);
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
		`/appeals-service/appeal-details/${appealId}/inquiry/change/address-details`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInquiryAddressDetails = async (request, response) => {
	const existingAddress = request.currentAppeal.inquiry.address;
	const sessionValues = pick(request.session['changeInquiry'], [
		'addressLine1',
		'addressLine2',
		'town',
		'county',
		'postCode'
	]);
	const values = isEmpty(sessionValues)
		? { ...existingAddress, postCode: existingAddress?.postcode }
		: sessionValues;

	return renderInquiryAddressDetails(request, response, values, 'change');
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
		`/appeals-service/appeal-details/${appealId}/inquiry/change/timetable-due-dates`
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

		//Start Case
		await startCaseService.setStartDate(
			request.apiClient,
			appealId,
			getTodaysISOString(),
			session.startCaseAppealProcedure?.[appealId]?.appealProcedure
		);

		const submittedAddress = {
			address: {
				...pick(inquiry, ['addressLine1', 'addressLine2', 'town', 'county']),
				postcode: inquiry['postCode']
			}
		};

		// Create Inquiry
		await createInquiry(request, {
			inquiryStartTime: dayMonthYearHourMinuteToISOString({
				day: inquiry['inquiry-date-day'],
				month: inquiry['inquiry-date-month'],
				year: inquiry['inquiry-date-year'],
				hour: inquiry['inquiry-time-hour'],
				minute: inquiry['inquiry-time-minute']
			}),
			...(inquiry.addressKnown === 'yes' && submittedAddress)
		});

		if (session.setUpInquiry.inquiryEstimationDays) {
			// Create Inquiry estimate
			await createInquiryEstimates(request, {
				estimatedTime: parseFloat(session.setUpInquiry.inquiryEstimationDays)
			});
		}

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
