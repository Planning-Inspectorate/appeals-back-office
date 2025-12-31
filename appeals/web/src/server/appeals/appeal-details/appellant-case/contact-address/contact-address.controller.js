import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	addContactAddress,
	renderManageContactAddress,
	updateContactAddress
} from './contact-address.service.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getManageContactAddress = async (request, response) => {
	return renderManageContactAddress(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddContactAddress = async (request, response) => {
	request.session.contactAddress = {
		addressLine1: request.body['addressLine1'],
		addressLine2: request.body['addressLine2'] === '' ? null : request.body['addressLine2'],
		town: request.body['town'],
		county: request.body['county'] === '' ? null : request.body['county'],
		postCode: request.body['postCode']
	};

	if (request.errors) {
		return renderManageContactAddress(request, response);
	}

	const { currentAppeal } = request;

	try {
		await addContactAddress(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId,
			request.session.contactAddress
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId: currentAppeal.appealId,
			text: 'Contact address updated'
		});

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);

		response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeContactAddress = async (request, response) => {
	const contactAddressId =
		request.currentAppeal?.enforcementNotice?.appellantCase?.contactAddress?.addressId;
	request.session.contactAddress = {
		addressLine1: request.body['addressLine1'],
		addressLine2: request.body['addressLine2'] === '' ? null : request.body['addressLine2'],
		town: request.body['town'],
		county: request.body['county'] === '' ? null : request.body['county'],
		postCode: request.body['postCode']
	};

	if (request.errors) {
		return renderManageContactAddress(request, response);
	}

	const { currentAppeal } = request;

	try {
		await updateContactAddress(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId,
			contactAddressId,
			request.session.contactAddress
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId: currentAppeal.appealId,
			text: 'Contact address updated'
		});

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);

		response.status(500).render('app/500.njk');
	}
};
