import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { changeSiteAddressPage } from './address.mapper.js';
import { changeSiteAddress } from './address.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeSiteAddress = async (request, response) => {
	return renderChangeSiteAddress(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeSiteAddress = async (request, response) => {
	const { errors, currentAppeal } = request;

	const backLinkUrl = request.originalUrl.split('/').slice(0, -3).join('/');

	const mappedPageContents = changeSiteAddressPage(
		currentAppeal,
		backLinkUrl,
		request.session.siteAddress,
		errors
	);

	return response.render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeSiteAddress = async (request, response) => {
	request.session.siteAddress = {
		addressLine1: request.body['addressLine1'],
		addressLine2: request.body['addressLine2'] === '' ? null : request.body['addressLine2'],
		town: request.body['town'],
		county: request.body['county'] === '' ? null : request.body['county'],
		postCode: request.body['postCode']
	};

	if (request.errors) {
		return renderChangeSiteAddress(request, response);
	}

	const {
		params: { appealId, addressId }
	} = request;
	const redirectUrl = request.originalUrl.split('/').slice(0, -3).join('/');

	try {
		await changeSiteAddress(request.apiClient, appealId, request.session.siteAddress, addressId);

		addNotificationBannerToSession(request.session, 'siteAddressUpdated', appealId);

		delete request.session.siteAddress;

		return response.redirect(redirectUrl);
	} catch (error) {
		logger.error(error);
	}

	return response.render('app/500.njk');
};
