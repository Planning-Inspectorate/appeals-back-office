import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	addressDetailsPage,
	addressKnownPage,
	checkDetailsPage,
	hearingDatePage
} from './set-up-hearing.mapper.js';
import logger from '#lib/logger.js';
import { isEmpty, isEqual, has, pick } from 'lodash-es';
import {
	dateISOStringToDayMonthYearHourMinute,
	dayMonthYearHourMinuteToISOString
} from '#lib/dates.js';
import { createHearing, updateHearing } from './hearing.service.js';
import { preserveQueryString, stripQueryString } from '#lib/url-utilities.js';

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
 * @param {{'hearing-date-day': string, 'hearing-date-month': string, 'hearing-date-year': string, 'hearing-time-hour': string, 'hearing-time-minute': string}} sessionValues
 * @returns {{day: string, month: string, year: string, hour: string, minute: string}}
 */
const sessionValuesToDateTime = (sessionValues) => {
	return {
		day: sessionValues['hearing-date-day'] || '',
		month: sessionValues['hearing-date-month'] || '',
		year: sessionValues['hearing-date-year'] || '',
		hour: sessionValues['hearing-time-hour'] || '',
		minute: sessionValues['hearing-time-minute'] || ''
	};
};

/**
 * Returns the previous page in the journey, or the CYA page if we are at the point where we started editing
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} prevPageUrl
 * @param {string} cyaUrl
 * @returns {string}
 */
const getBackLinkUrl = (request, prevPageUrl, cyaUrl) => {
	const editEntrypoint = String(request.query.editEntrypoint);
	return stripQueryString(editEntrypoint) === stripQueryString(request.originalUrl)
		? preserveQueryString(request, cyaUrl, { exclude: ['editEntrypoint'] })
		: preserveQueryString(request, prevPageUrl);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getHearingDate = async (request, response) => {
	const sessionValues = request.session['setUpHearing'] || {};

	return renderHearingDate(request, response, sessionValuesToDateTime(sessionValues), 'setup');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeHearingDate = async (request, response) => {
	const sessionValues = request.session['changeHearing'] || {};
	const dateTimeKeys = [
		'hearing-date-day',
		'hearing-date-month',
		'hearing-date-year',
		'hearing-time-hour',
		'hearing-time-minute'
	];

	const values = dateTimeKeys.some((key) => sessionValues[key])
		? sessionValuesToDateTime(sessionValues)
		: dateISOStringToDayMonthYearHourMinute(request.currentAppeal.hearing.hearingStartTime);

	return renderHearingDate(request, response, values, 'change');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {{day?: string | number, month?: string | number, year?: string | number, hour?: string | number, minute?: string | number}} values
 * @param {string} action
 */
export const renderHearingDate = async (request, response, values, action) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;
	const { appealId } = appealDetails;
	const backLinkUrl = getBackLinkUrl(
		request,
		`/appeals-service/appeal-details/${appealId}`,
		`/appeals-service/appeal-details/${appealId}/hearing/${action}/check-details`
	);

	const mappedPageContent = hearingDatePage(appealDetails, values, backLinkUrl);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postHearingDate = async (request, response) => {
	if (request.errors) {
		return renderHearingDate(
			request,
			response,
			sessionValuesToDateTime(request.session['setUpHearing'] || {}),
			'setup'
		);
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/hearing/setup/address`
		)
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeHearingDate = async (request, response) => {
	if (request.errors) {
		const sessionValues = request.session['changeHearing'];
		const values = sessionValues
			? sessionValuesToDateTime(sessionValues)
			: request.currentAppeal.hearing;
		return renderHearingDate(request, response, values, 'change');
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/hearing/change/address`
		)
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getHearingAddress = async (request, response) => {
	return renderHearingAddress(request, response, 'setup', request.session.setUpHearing || {});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeHearingAddress = async (request, response) => {
	const appealDetails = request.currentAppeal;
	const sessionValues = request.session.changeHearing || {};

	const values = has(sessionValues, 'addressKnown')
		? sessionValues
		: { addressKnown: appealDetails.hearing?.address ? 'yes' : 'no' };

	return renderHearingAddress(request, response, 'change', values);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {{addressKnown: string}} [values]
 * @param {'change' | 'setup'} action
 */
export const renderHearingAddress = (request, response, action, values) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;
	const { appealId } = appealDetails;
	const backLinkUrl = getBackLinkUrl(
		request,
		`/appeals-service/appeal-details/${appealId}/hearing/${action}/date`,
		`/appeals-service/appeal-details/${appealId}/hearing/${action}/check-details`
	);

	const mappedPageContent = addressKnownPage(appealDetails, action, backLinkUrl, values);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postHearingAddress = async (request, response) => {
	if (request.errors) {
		return renderHearingAddress(request, response, 'setup');
	}

	const { appealId } = request.currentAppeal;

	const baseUrl = `/appeals-service/appeal-details/${appealId}/hearing/setup`;
	const nextStepUrl =
		request.body.addressKnown === 'yes'
			? preserveQueryString(request, `${baseUrl}/address-details`)
			: preserveQueryString(request, `${baseUrl}/check-details`, { exclude: ['editEntrypoint'] });

	return response.redirect(nextStepUrl);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeHearingAddress = async (request, response) => {
	if (request.errors) {
		return renderHearingAddress(request, response, 'change');
	}

	const { appealId } = request.currentAppeal;

	const baseUrl = `/appeals-service/appeal-details/${appealId}/hearing/change`;
	const nextStepUrl =
		request.body.addressKnown === 'yes'
			? preserveQueryString(request, `${baseUrl}/address-details`)
			: preserveQueryString(request, `${baseUrl}/check-details`, { exclude: ['editEntrypoint'] });

	return response.redirect(nextStepUrl);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getHearingAddressDetails = async (request, response) => {
	const values = request.session['setUpHearing'] || {};

	return renderHearingAddressDetails(request, response, values, 'setup');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeHearingAddressDetails = async (request, response) => {
	const existingAddress = request.currentAppeal.hearing.address;
	const sessionValues = pick(request.session['changeHearing'], [
		'addressLine1',
		'addressLine2',
		'town',
		'county',
		'postCode'
	]);
	const values = isEmpty(sessionValues)
		? { ...existingAddress, postCode: existingAddress?.postcode }
		: sessionValues;

	return renderHearingAddressDetails(request, response, values, 'change');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('@pins/appeals').Address} values
 * @param {'setup' | 'change'} action
 */
export const renderHearingAddressDetails = (request, response, values, action) => {
	const { currentAppeal, errors } = request;
	const { appealId } = currentAppeal;
	const backLinkUrl = getBackLinkUrl(
		request,
		`/appeals-service/appeal-details/${appealId}/hearing/${action}/address`,
		`/appeals-service/appeal-details/${appealId}/hearing/${action}/check-details`
	);

	const mappedPageContent = addressDetailsPage(currentAppeal, action, values, errors, backLinkUrl);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postHearingAddressDetails = async (request, response) => {
	if (request.errors) {
		const values = request.session['setUpHearing'] || {};
		return renderHearingAddressDetails(request, response, values, 'setup');
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/hearing/setup/check-details`,
			{ exclude: ['editEntrypoint'] }
		)
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeHearingAddressDetails = async (request, response) => {
	if (request.errors) {
		const values = request.session['changeHearing'] || {};
		return renderHearingAddressDetails(request, response, values, 'change');
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/hearing/change/check-details`,
			{ exclude: ['editEntrypoint'] }
		)
	);
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

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getHearingCheckDetails = async (request, response) => {
	if (!request.session.setUpHearing) {
		return renderAlreadySubmittedError(request, response);
	}

	const values = request.session.setUpHearing;

	const mappedPageContent = await checkDetailsPage(
		request.currentAppeal,
		{
			hearingDateTime: dayMonthYearHourMinuteToISOString({
				day: values['hearing-date-day'],
				month: values['hearing-date-month'],
				year: values['hearing-date-year'],
				hour: values['hearing-time-hour'],
				minute: values['hearing-time-minute']
			}),
			addressKnown: values.addressKnown,
			address: pick(values, ['addressLine1', 'addressLine2', 'town', 'county', 'postCode'])
		},
		'setup'
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/**
 * @param {Record<string, string>} sessionData
 * @param {string} existingStartTime
 * @returns {string}
 */
const hearingStartTimeForUpdate = (sessionData, existingStartTime) => {
	const sessionDateTimeKeys = [
		'hearing-date-day',
		'hearing-date-month',
		'hearing-date-year',
		'hearing-time-hour',
		'hearing-time-minute'
	];

	// Use the submitted date & time if present, otherwise use the existing date & time
	return sessionDateTimeKeys.every((key) => sessionData[key])
		? dayMonthYearHourMinuteToISOString({
				day: sessionData['hearing-date-day'],
				month: sessionData['hearing-date-month'],
				year: sessionData['hearing-date-year'],
				hour: sessionData['hearing-time-hour'],
				minute: sessionData['hearing-time-minute']
		  })
		: existingStartTime;
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeHearingCheckDetails = async (request, response) => {
	if (!request.session.changeHearing) {
		return renderAlreadySubmittedError(request, response);
	}

	const values = request.session.changeHearing;

	const mappedPageContent = await checkDetailsPage(
		request.currentAppeal,
		{
			hearingDateTime: hearingStartTimeForUpdate(
				values,
				request.currentAppeal.hearing?.hearingStartTime
			),
			addressKnown: values.addressKnown ?? 'yes', // if unset then we went straight to the address details page which implies 'yes'
			address: pick(values, ['addressLine1', 'addressLine2', 'town', 'county', 'postCode'])
		},
		'change'
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postHearingCheckDetails = async (request, response) => {
	const { appealId } = request.currentAppeal;
	const hearing = request.session.setUpHearing;

	if (!hearing) {
		return renderAlreadySubmittedError(request, response);
	}

	try {
		const submittedAddress = {
			address: {
				...pick(hearing, ['addressLine1', 'addressLine2', 'town', 'county']),
				postcode: hearing['postCode']
			}
		};
		await createHearing(request, {
			hearingStartTime: dayMonthYearHourMinuteToISOString({
				day: hearing['hearing-date-day'],
				month: hearing['hearing-date-month'],
				year: hearing['hearing-date-year'],
				hour: hearing['hearing-time-hour'],
				minute: hearing['hearing-time-minute']
			}),
			...(hearing.addressKnown === 'yes' && submittedAddress)
		});

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'hearingSetUp',
			appealId
		});

		delete request.session.setUpHearing;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeHearingCheckDetails = async (request, response) => {
	const { appealId, hearing } = request.currentAppeal;
	const sessionData = request.session.changeHearing;

	if (!sessionData) {
		return renderAlreadySubmittedError(request, response);
	}

	const submittedAddress = {
		...pick(sessionData, ['addressLine1', 'addressLine2', 'town', 'county']),
		postcode: sessionData['postCode']
	};
	let address;
	if (sessionData.addressKnown === 'no') {
		address = null;
	} else if (!isEqual(submittedAddress, hearing?.address)) {
		address = submittedAddress;
	}

	try {
		await updateHearing(request, request.currentAppeal.hearing.hearingId, {
			hearingStartTime: hearingStartTimeForUpdate(sessionData, hearing.hearingStartTime),
			address
		});

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'hearingUpdated',
			appealId
		});

		delete request.session.changeHearing;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
