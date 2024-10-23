import { ipAddressPage } from '../interested-party-comments.mapper.js';
import { updateAddress } from './service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export async function renderEditAddress(request, response) {
	const { currentAppeal, currentComment, errors } = request;

	const pageContent = ipAddressPage(
		currentAppeal,
		currentComment?.represented?.address,
		errors,
		`${currentAppeal.appealId}/view`
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
export async function postEditAddress(request, response) {
	if (request.errors) {
		return renderEditAddress(request, response);
	}

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
