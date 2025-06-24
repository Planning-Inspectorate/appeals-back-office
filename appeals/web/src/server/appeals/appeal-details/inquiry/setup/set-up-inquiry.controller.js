import { inquiryDatePage, addressDetailsPage, addressKnownPage } from './set-up-inquiry.mapper.js';
import { isEmpty, has, pick } from 'lodash-es';

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

	return response.redirect(`/appeals-service/appeal-details/${appealId}/inquiry/setup/timetable`);
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

	return response.redirect(`/appeals-service/appeal-details/${appealId}/inquiry/change/timetable`);
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

	return response.redirect(`/appeals-service/appeal-details/${appealId}/inquiry/setup/timetable`);
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

	return response.redirect(`/appeals-service/appeal-details/${appealId}/inquiry/change/timetable`);
};
