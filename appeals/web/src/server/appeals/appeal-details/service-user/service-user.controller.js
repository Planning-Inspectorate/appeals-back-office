import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { capitalize } from 'lodash';
import { changeServiceUserPage } from './service-user.mapper.js';
import { updateServiceUser } from './service-user.service.js';

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

	const appealDetails = request.currentAppeal;
	if (appealDetails && userType in appealDetails) {
		const mappedPageContents = changeServiceUserPage(
			appealDetails,
			request.session.updatedServiceUser,
			userType,
			errors
		);

		return response.render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	}

	return response.render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeServiceUser = async (request, response) => {
	request.session.updatedServiceUser = {
		firstName: request.body['firstName'],
		lastName: request.body['lastName'],
		email: request.body['emailAddress']
	};

	const {
		params: { appealId, userType }
	} = request;

	const appealDetails = request.currentAppeal;

	if (request.errors) {
		return renderChangeServiceUser(request, response);
	}

	try {
		// @ts-ignore
		const serviceUserId = appealDetails[userType]?.id;
		await updateServiceUser(
			request.apiClient,
			appealId,
			serviceUserId,
			userType,
			request.session.updatedServiceUser
		);

		addNotificationBannerToSession(
			request.session,
			'serviceUserUpdated',
			appealId,
			`<p class="govuk-notification-banner__heading">${capitalize(userType)}details updated</p>`
		);

		delete request.session.updatedServiceUser;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.render('app/500.njk');
};
