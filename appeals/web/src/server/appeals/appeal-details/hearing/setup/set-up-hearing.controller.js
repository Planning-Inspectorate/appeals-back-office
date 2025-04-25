import { setUpHearingPage } from './set-up-hearing.mapper.js';

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

	const mappedPageContent = await setUpHearingPage(appealDetails, values);

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
	/// TODO: Not yet implemented
	return response.status(404).render('app/404.njk');
};
