import url from 'url';
import { ipAddressPage } from '../interested-party-comments.mapper.js';
import { updateAddress } from './edit-ip-comment.service.js';
import { checkAddressPage } from './edit-ip-comment.mappers.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export async function renderEditAddress(request, response) {
	const {
		currentAppeal,
		currentComment,
		errors,
		query: { review, editAddress }
	} = request;
	const backLinkUrl = review === 'true' ? 'review' : 'view';
	const operationType = editAddress === 'true' ? 'update' : 'add';

	const pageContent = ipAddressPage(
		currentAppeal,
		currentComment?.represented?.address,
		errors,
		`${currentComment.id}/${backLinkUrl}`,
		operationType
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
	const { currentAppeal, currentComment, session } = request;

	await updateAddress(
		request.apiClient,
		currentAppeal.appealId,
		currentComment.represented?.id,
		request.session.editIpComment
	);

	const redirectPath = request.query.review === 'true' ? 'review' : 'view';

	if (request.session.editIpComment.operationType) {
		const bannerKey =
			request.session.editIpComment.operationType === 'add'
				? 'interestedPartyCommentsAddressAddedSuccess'
				: 'interestedPartyCommentsAddressUpdatedSuccess';
		addNotificationBannerToSession(session, bannerKey, currentAppeal.appealId);
	}

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
		url.format({
			pathname: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentComment.id}/edit/check/address`,
			query: {
				editAddress: request.query.editAddress === 'true'
			}
		})
	);
}
