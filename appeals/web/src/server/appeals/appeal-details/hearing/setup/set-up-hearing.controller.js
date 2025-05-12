import { addressDetailsPage, addressKnownPage, hearingDatePage } from './set-up-hearing.mapper.js';

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
