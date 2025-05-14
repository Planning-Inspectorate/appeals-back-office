import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	addressDetailsPage,
	addressKnownPage,
	checkDetailsPage,
	hearingDatePage
} from './set-up-hearing.mapper.js';
import logger from '#lib/logger.js';
import { pick } from 'lodash-es';
import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import { createHearing } from './set-up-hearing.service.js';

/**
 * @param {string} path
 * @param {string} sessionKey
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const redirectAndClearSession = (path, sessionKey) => (request, response) => {
	const { currentAppeal } = request;

	delete request.session[sessionKey];

	response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/hearing/setup${path}`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const redirectToHearingDate = (request, response) => {
	const { currentAppeal } = request;
	response.redirect(`/appeals-service/appeal-details/${currentAppeal.appealId}/hearing/setup/date`);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getHearingDate = async (request, response) => {
	return renderHearingDate(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderHearingDate = async (request, response) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	const sourceValues = request.session['setUpHearing'] || {};

	const values = {
		day: sourceValues['hearing-date-day'] || '',
		month: sourceValues['hearing-date-month'] || '',
		year: sourceValues['hearing-date-year'] || '',
		hour: sourceValues['hearing-time-hour'] || '',
		minute: sourceValues['hearing-time-minute'] || ''
	};

	const mappedPageContent = await hearingDatePage(appealDetails, values);

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
		return renderHearingDate(request, response);
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(`/appeals-service/appeal-details/${appealId}/hearing/setup/address`);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getHearingAddress = async (request, response) => {
	return renderHearingAddress(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderHearingAddress = async (request, response) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	const values = request.session['setUpHearing'] || {};

	const mappedPageContent = await addressKnownPage(appealDetails, values);

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
		return renderHearingAddress(request, response);
	}

	const { appealId } = request.currentAppeal;

	const nextStep = request.body.addressKnown === 'yes' ? 'address-details' : 'check-details';

	return response.redirect(`/appeals-service/appeal-details/${appealId}/hearing/setup/${nextStep}`);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getHearingAddressDetails = async (request, response) => {
	return renderHearingAddressDetails(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderHearingAddressDetails = async (request, response) => {
	const { currentAppeal, errors, session } = request;

	const values = session['setUpHearing'] || {};
	const backLinkUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/hearing/setup/address`;

	const mappedPageContent = await addressDetailsPage(currentAppeal, backLinkUrl, values, errors);

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
		return renderHearingAddressDetails(request, response);
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/hearing/setup/check-details`
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

	const mappedPageContent = await checkDetailsPage(request.currentAppeal, {
		hearingDateTime: dayMonthYearHourMinuteToISOString({
			day: values['hearing-date-day'],
			month: values['hearing-date-month'],
			year: values['hearing-date-year'],
			hour: values['hearing-time-hour'],
			minute: values['hearing-time-minute']
		}),
		addressKnown: values.addressKnown,
		address: pick(values, ['addressLine1', 'addressLine2', 'town', 'county', 'postCode'])
	});

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
		await createHearing(request, {
			hearingStartTime: dayMonthYearHourMinuteToISOString({
				day: hearing['hearing-date-day'],
				month: hearing['hearing-date-month'],
				year: hearing['hearing-date-year'],
				hour: hearing['hearing-time-hour'],
				minute: hearing['hearing-time-minute']
			}),
			...(hearing.addressKnown === 'yes' && {
				address: {
					...pick(hearing, ['addressLine1', 'addressLine2', 'town', 'county']),
					postcode: hearing['postCode']
				}
			})
		});

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'hearingSetUp',
			appealId
		});

		delete request.session.hearingEstimates;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
