import {
	dateISOStringToDayMonthYearHourMinute,
	dayMonthYearHourMinuteToISOString,
	getTodaysISOString
} from '#lib/dates.js';
import { applyEditsForAppeal, clearEdits, getSessionValuesForAppeal } from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { resolveAppealId } from '#lib/resolveAppealId.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { isEmpty, isEqual, pick } from 'lodash-es';
import {
	addressDetailsPage,
	addressKnownPage,
	confirmChangeInquiryPage,
	confirmInquiryPage,
	inquiryDatePage,
	inquiryDueDatesPage,
	inquiryEstimationPage
} from './set-up-inquiry.mapper.js';
import {
	addAppellantCaseToLocals,
	createInquiry,
	updateInquiry
} from './set-up-inquiry.service.js';

/** @typedef {import('express').NextFunction} NextFunction */

const getBackLinkUrl = backLinkGenerator('setUpInquiry');

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
 * @param {Record<string, string>} sessionValues
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
	const sessionValues = getSessionValuesForAppeal(
		request,
		'setUpInquiry',
		request.currentAppeal.appealId
	);

	const getBackLinkUrl = backLinkGenerator('setUpInquiry');
	const backUrl = getBackLinkUrl(
		request,
		null,
		`/appeals-service/appeal-details/${request.currentAppeal.appealId}/inquiry/setup/check-details`
	);

	return renderInquiryDate(request, response, backUrl, sessionValuesToDateTime(sessionValues));
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInquiryDate = async (request, response) => {
	const sessionValues = request.session['changeInquiry'] || {};

	const getBackLinkUrl = backLinkGenerator('changeInquiry');
	const backUrl = getBackLinkUrl(
		request,
		null,
		`/appeals-service/appeal-details/${request.currentAppeal.appealId}/inquiry/change/check-details`
	);

	return renderInquiryDate(request, response, backUrl, sessionValuesToDateTime(sessionValues));
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} backUrl
 * @param {{day?: string | number, month?: string | number, year?: string | number, hour?: string | number, minute?: string | number}} values
 */
export const renderInquiryDate = async (request, response, backUrl, values) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	const mappedPageContent = await inquiryDatePage(appealDetails, values, backUrl);

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
		const sessionValues = getSessionValuesForAppeal(
			request,
			'setUpInquiry',
			request.currentAppeal.appealId
		);
		return renderInquiryDate(
			request,
			response,
			'setup',
			sessionValuesToDateTime(sessionValues || {})
		);
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/inquiry/setup/estimation`
		)
	);
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
	const sessionValues = getSessionValuesForAppeal(
		request,
		'setUpInquiry',
		request.currentAppeal.appealId
	);
	return renderInquiryEstimation(request, response, 'setup', sessionValues || {});
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
 * @param {Record<string, string>} [values]
 */
export const renderInquiryEstimation = async (request, response, action, values) => {
	const { errors } = request;
	const appealDetails = request.currentAppeal;

	const baseUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/inquiry/${action}`;
	const backUrl = getBackLinkUrl(request, `${baseUrl}/date`, `${baseUrl}/check-details`);

	const mappedPageContent = inquiryEstimationPage(appealDetails, action, backUrl, errors, values);

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
		const sessionValues = getSessionValuesForAppeal(
			request,
			'setUpInquiry',
			request.currentAppeal.appealId
		);
		return renderInquiryEstimation(request, response, 'setup', sessionValues);
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/inquiry/setup/address`
		)
	);
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
	const id = resolveAppealId(request);
	const sessionValues = getSessionValuesForAppeal(request, 'setUpInquiry', id);
	return renderInquiryAddress(request, response, 'setup', sessionValues);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {Record<string, string>} [values]
 * @param {'change' | 'setup'} action
 */
export const renderInquiryAddress = async (request, response, action, values = {}) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	const baseUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/inquiry/${action}`;
	const backUrl = getBackLinkUrl(request, `${baseUrl}/estimation`, `${baseUrl}/check-details`);

	const mappedPageContent = addressKnownPage(appealDetails, backUrl, values);

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

	const { appealId, procedureType } = request.currentAppeal;

	if (request.body.addressKnown === 'yes') {
		return response.redirect(
			preserveQueryString(
				request,
				`/appeals-service/appeal-details/${appealId}/inquiry/setup/address-details`
			)
		);
	}

	if (procedureType.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY) {
		return response.redirect(
			preserveQueryString(
				request,
				`/appeals-service/appeal-details/${appealId}/inquiry/setup/check-details`
			)
		);
	}
	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/inquiry/setup/timetable-due-dates`
		)
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInquiryAddressDetails = async (request, response) => {
	const sessionValues = getSessionValuesForAppeal(
		request,
		'setUpInquiry',
		request.currentAppeal.appealId
	);
	return renderInquiryAddressDetails(request, response, sessionValues, 'setup');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {Record<string, string>} values
 * @param {'setup' | 'change'} action
 */
export const renderInquiryAddressDetails = async (request, response, values, action) => {
	const { currentAppeal, errors } = request;

	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry/${action}`;
	const backUrl = getBackLinkUrl(request, `${baseUrl}/address`, `${baseUrl}/check-details`);

	const mappedPageContent = addressDetailsPage(currentAppeal, backUrl, values, errors);

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
		const id = resolveAppealId(request);
		const sessionValues = request.session['setUpInquiry']?.[id] || {};
		return renderInquiryAddressDetails(request, response, sessionValues, 'setup');
	}

	const { appealId } = request.currentAppeal;

	return response.redirect(
		preserveQueryString(
			request,
			request.currentAppeal.procedureType.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY
				? `/appeals-service/appeal-details/${appealId}/inquiry/setup/check-details`
				: `/appeals-service/appeal-details/${appealId}/inquiry/setup/timetable-due-dates`
		)
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInquiryDueDates = async (request, response) => {
	const sessionValues = getSessionValuesForAppeal(
		request,
		'setUpInquiry',
		request.currentAppeal.appealId
	);
	return renderInquiryDueDates(request, response, 'setup', sessionValues);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInquiryDueDates = async (request, response) => {
	const sessionValues = getSessionValuesForAppeal(
		request,
		'changeInquiry',
		request.currentAppeal.appealId
	);
	return renderInquiryDueDates(request, response, 'change', sessionValues);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {Record<string, string>} [values]
 * @param {'change' | 'setup'} action
 */
export const renderInquiryDueDates = async (request, response, action, values = {}) => {
	const { currentAppeal, errors } = request;

	const appellantCase = await addAppellantCaseToLocals(request);

	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry/${action}`;
	const prevPageSlug = values?.addressKnown === 'yes' ? 'address-details' : 'address';
	const backUrl = getBackLinkUrl(request, `${baseUrl}/${prevPageSlug}`, `${baseUrl}/check-details`);

	const mappedPageContent = await inquiryDueDatesPage(
		currentAppeal,
		values,
		backUrl,
		appellantCase,
		errors
	);

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
		const id = resolveAppealId(request);
		const sessionValues = request.session['setUpInquiry']?.[id] || {};
		return renderInquiryDueDates(request, response, 'setup', sessionValues);
	}

	const { appealId } = request.currentAppeal;

	applyEditsForAppeal(request, 'setUpInquiry', appealId);

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

	applyEditsForAppeal(request, 'changeInquiry', appealId);

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

	applyEditsForAppeal(request, 'changeInquiry', appealId);

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

	// Answer yes to address known if we have submitted an address (we probably
	// came straight to this page)
	request.session['changeInquiry']['addressKnown'] = 'yes';

	applyEditsForAppeal(request, 'changeInquiry', appealId);

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
		currentAppeal: { appealId, appealReference, procedureType },
		session,
		errors
	} = request;

	const appellantCase = await addAppellantCaseToLocals(request);

	if (
		!session.startCaseAppealProcedure?.[appealId]?.appealProcedure &&
		procedureType.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY
	) {
		return response.status(500).render('app/500.njk');
	}

	clearEdits(request, 'setUpInquiry');

	const mappedPageContent = confirmInquiryPage(
		appealId,
		appealReference,
		appellantCase?.planningObligation?.hasObligation,
		'setup',
		session,
		procedureType.toLowerCase()
	);

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

	clearEdits(request, 'changeInquiry');

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
			currentAppeal: { appealId, procedureType }
		} = request;

		const { session } = request;

		const inquiry = request.session['setUpInquiry']?.[appealId];

		if (!inquiry) {
			return renderAlreadySubmittedError(request, response);
		}

		const isStartCase = procedureType.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY;

		if (!session.startCaseAppealProcedure?.[appealId]?.appealProcedure && isStartCase) {
			return response.status(500).render('app/500.njk');
		}

		const appellantCase = await addAppellantCaseToLocals(request);
		const inquiryRequest = {
			...buildInquiryRequest(inquiry, appellantCase?.planningObligation?.hasObligation),
			startDate: getTodaysISOString(),
			isStartCase
		};
		//Create Inquiry
		await createInquiry(request, inquiryRequest);

		if (isStartCase) {
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
		} else {
			if (inquiryRequest.address) {
				addNotificationBannerToSession({
					session: request.session,
					bannerDefinitionKey: 'inquirySetUp',
					appealId
				});
			} else {
				addNotificationBannerToSession({
					session: request.session,
					bannerDefinitionKey: 'inquiryReadyToSetup',
					appealId
				});
			}
		}

		delete request.session['setUpInquiry']?.[appealId];

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
 * @param {boolean} hasObligation
 * @returns {{estimatedDays?: string, inquiryStartTime: string, lpaQuestionnaireDueDate: string, statementDueDate: string, ipCommentsDueDate: string, statementOfCommonGroundDueDate: string, proofOfEvidenceAndWitnessesDueDate: string,  address?: {addressLine1: string, addressLine2?: string, town: string, county?: string, postcode: string}}}
 */
const buildInquiryRequest = (inquiry, hasObligation) => {
	const submittedAddress = {
		address: {
			...pick(inquiry, ['addressLine1', 'addressLine2', 'town', 'county']),
			postcode: inquiry['postCode']
		}
	};

	/**
	 * @type {{inquiryStartTime: string, lpaQuestionnaireDueDate: string, statementDueDate: string, ipCommentsDueDate: string, statementOfCommonGroundDueDate: string, proofOfEvidenceAndWitnessesDueDate: string, planningObligationDueDate?: string, estimatedDays?: string, address?: {addressLine1: string, addressLine2?: string, town: string, county?: string, postcode: string}}}
	 */
	const confirmDetails = {
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
			day: inquiry['proof-of-evidence-and-witnesses-due-date-day'],
			month: inquiry['proof-of-evidence-and-witnesses-due-date-month'],
			year: inquiry['proof-of-evidence-and-witnesses-due-date-year']
		})
	};

	if (hasObligation) {
		confirmDetails.planningObligationDueDate = dayMonthYearHourMinuteToISOString({
			day: inquiry['planning-obligation-due-date-day'],
			month: inquiry['planning-obligation-due-date-month'],
			year: inquiry['planning-obligation-due-date-year']
		});
	}

	return confirmDetails;
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
