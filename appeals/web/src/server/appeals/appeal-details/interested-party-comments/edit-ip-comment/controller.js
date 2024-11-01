import { ipAddressPage } from '../interested-party-comments.mapper.js';
import { updateAddress } from './service.js';
import { checkAddressPage } from './mappers.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export async function renderEditAddress(request, response) {
	const {
		currentAppeal,
		currentComment,
		errors,
		query: { review }
	} = request;
	const backLinkUrl = review === 'true' ? 'review' : 'view';

	const pageContent = ipAddressPage(
		currentAppeal,
		currentComment?.represented?.address,
		errors,
		`${currentComment.id}/${backLinkUrl}`
	);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		errors,
		pageContent
	});
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export async function renderCheckAddress(request, response) {
	const { currentAppeal, currentComment } = request;

	const pageContent = checkAddressPage(
		currentAppeal,
		currentComment.id,
		request.session.editIpComment
	);

	return response.render('patterns/check-and-confirm-page.pattern.njk', {
		errors: request.errors,
		pageContent
	});
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export async function postCheckPage(request, response) {
	const { currentAppeal, currentComment } = request;

	await updateAddress(
		request.apiClient,
		currentAppeal.appealId,
		currentComment.represented?.id,
		request.body
	);

	const redirectPath = request.query.review === 'true' ? 'review' : 'view';

	return response
		.status(200)
		.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentComment.id}/${redirectPath}`
		);
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export async function postEditAddress(request, response) {
	const { currentAppeal, currentComment } = request;

	if (request.errors) {
		return renderEditAddress(request, response);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentComment.id}/edit/check/address`
	);
}
