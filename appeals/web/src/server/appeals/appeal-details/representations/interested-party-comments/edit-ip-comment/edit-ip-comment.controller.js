import url from 'url';
import { ipAddressPage } from '../interested-party-comments.mapper.js';
import {
	updateAddress,
	unsetSiteVisitRequested,
	patchInterestedPartyComment
} from './edit-ip-comment.service.js';
import { checkAddressPage, siteVisitRequestedPage } from './edit-ip-comment.mappers.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { preserveQueryString, stripQueryString } from '#lib/url-utilities.js';
import { applyEdits, clearEdits, getSessionValues } from '#lib/edit-utilities.js';
import { isEmpty } from 'lodash-es';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export async function renderEditAddress(request, response) {
	const {
		currentAppeal,
		currentRepresentation,
		errors,
		query: { review, editAddress }
	} = request;
	const backLinkUrl = review === 'true' ? 'review' : 'view';
	const operationType = editAddress === 'true' ? 'update' : 'add';
	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentRepresentation.id}`;
	const backUrl =
		stripQueryString(String(request.query.editEntrypoint)) === stripQueryString(request.originalUrl)
			? `${baseUrl}/edit/check/address`
			: `${baseUrl}/${backLinkUrl}`;
	const editIpComment = getSessionValues(request, 'editIpComment');
	const address = isEmpty(editIpComment)
		? currentRepresentation?.represented?.address
		: editIpComment;

	const pageContent = ipAddressPage(
		currentAppeal,
		address,
		errors,
		preserveQueryString(request, backUrl, { exclude: ['editEntrypoint'] }),
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
export async function renderSiteVisitRequested(request, response) {
	const { errors, currentAppeal, currentRepresentation } = request;

	const pageContent = siteVisitRequestedPage(currentAppeal, currentRepresentation.id);

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
	const { currentAppeal, currentRepresentation } = request;

	clearEdits(request, 'editIpComment');

	const pageContent = checkAddressPage(
		currentAppeal,
		currentRepresentation.id,
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
	const { currentAppeal, currentRepresentation, session } = request;

	await updateAddress(
		request.apiClient,
		currentAppeal.appealId,
		currentRepresentation.represented?.id,
		request.session.editIpComment
	);

	// patch representation with no changes, handle any linking required from address change
	await patchInterestedPartyComment(
		request.apiClient,
		currentAppeal.appealId,
		currentRepresentation.id.toString()
	);

	const redirectPath = request.query.review === 'true' ? 'review' : 'view';

	if (request.session.editIpComment.operationType) {
		addNotificationBannerToSession({
			session,
			bannerDefinitionKey:
				request.session.editIpComment.operationType === 'add'
					? 'interestedPartyCommentsAddressAddedSuccess'
					: 'interestedPartyCommentsAddressUpdatedSuccess',
			appealId: currentAppeal.appealId
		});
	}

	return response
		.status(200)
		.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentRepresentation.id}/${redirectPath}`
		);
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export async function postEditAddress(request, response) {
	const { errors, currentAppeal, currentRepresentation } = request;

	if (errors) {
		return renderEditAddress(request, response);
	}

	applyEdits(request, 'editIpComment');

	return response.redirect(
		url.format({
			pathname: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentRepresentation.id}/edit/check/address`,
			query: {
				editAddress: request.query.editAddress === 'true'
			}
		})
	);
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export async function postSiteVisitRequested(request, response) {
	const { apiClient, errors, currentAppeal, currentRepresentation, body } = request;

	if (errors) {
		return renderSiteVisitRequested(request, response);
	}

	if (body.siteVisitRequested === 'yes') {
		await unsetSiteVisitRequested(apiClient, currentAppeal.appealId, currentRepresentation.id);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentRepresentation.id}/view`
	);
}
