import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { capitalize } from 'lodash-es';
import { HTTPError } from 'got';
import { changeServiceUserPage } from './service-user.mapper.js';
import { updateServiceUser } from './service-user.service.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeServiceUser = async (request, response) => {
	return renderChangeServiceUser(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeServiceUser = async (request, response) => {
	const {
		errors,
		params: { userType }
	} = request;

	const backLinkUrl = request.originalUrl.split('/').slice(0, -3).join('/');

	const appealDetails = request.currentAppeal;
	if (appealDetails && userType in appealDetails) {
		const mappedPageContents = changeServiceUserPage(
			appealDetails,
			request.session.updatedServiceUser,
			userType,
			backLinkUrl,
			errors
		);
		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	}
	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeServiceUser = async (request, response) => {
	request.session.updatedServiceUser = {
		firstName: request.body['firstName'],
		lastName: request.body['lastName'],
		organisationName: request.body['organisationName'],
		email: request.body['emailAddress'],
		phoneNumber: request.body['phoneNumber']
	};

	const {
		params: { appealId, userType }
	} = request;

	const appealDetails = request.currentAppeal;

	if (request.errors) {
		return renderChangeServiceUser(request, response);
	}

	const origin = getOriginPathname(request);
	const backToMenuUrl = origin.split('/').slice(0, -3).join('/');

	if (!isInternalUrl(backToMenuUrl, request)) {
		return response.status(400).render('errorPageTemplate', {
			message: 'Invalid redirection attempt detected.'
		});
	}

	try {
		// @ts-ignore
		const serviceUserId = appealDetails[userType]?.serviceUserId;

		if (!serviceUserId) {
			return response.status(404).render('app/404.njk');
		}

		await updateServiceUser(
			request.apiClient,
			appealId,
			serviceUserId,
			userType,
			request.session.updatedServiceUser
		);

		addNotificationBannerToSession(
			request.session,
			'changePage',
			appealId,
			`<p class="govuk-notification-banner__heading">${capitalize(userType)} details updated</p>`
		);

		delete request.session.updatedServiceUser;

		return response.redirect(backToMenuUrl);
	} catch (error) {
		logger.error(error);

		// Check if it's a validation error (400)
		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderChangeServiceUser(request, response);
		}
	}

	return response.status(500).render('app/500.njk');
};
