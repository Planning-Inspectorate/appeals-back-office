import { checkAddressPage, ipAddressPage, ipDetailsPage } from './add-ip-comment.mapper.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderIpDetails(request, response) {
	const pageContent = ipDetailsPage(request.currentAppeal);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		errors: request.errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderCheckAddress(request, response) {
	const pageContent = checkAddressPage(request.currentAppeal);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		errors: request.errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderIpAddress(request, response) {
	const pageContent = ipAddressPage(request.currentAppeal);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		errors: request.errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postIpDetails(request, response) {
	return response.redirect('./check-address');
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postCheckAddress(request, response) {
	const { currentAppeal } = request;
	const addressProvided = request.body['address-provided'] === 'yes';

	return response.redirect(
		addressProvided
			? './ip-address'
			: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postIpAddress(request, response) {
	const { currentAppeal } = request;

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function redirectTopLevel(request, response) {
	return response.redirect('./add/ip-details');
}