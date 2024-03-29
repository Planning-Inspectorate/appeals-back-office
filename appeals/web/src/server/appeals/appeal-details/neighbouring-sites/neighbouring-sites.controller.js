import { getAppealDetailsFromId } from '../appeal-details.service.js';
import {
	addNeighbouringSiteCheckAndConfirmPage,
	addNeighbouringSitePage,
	changeNeighbouringSiteCheckAndConfirmPage,
	changeNeighbouringSitePage,
	manageNeighbouringSitesPage,
	removeNeighbouringSitePage
} from './neighbouring-sites.mapper.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import {
	addNeighbouringSite,
	changeNeighbouringSite,
	removeNeighbouringSite
} from './neighbouring-sites.service.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddNeighbouringSite = async (request, response) => {
	return renderAddNeighbouringSite(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAddNeighbouringSite = async (request, response) => {
	const {
		errors,
		params: { appealId }
	} = request;

	const appealsDetails = await getAppealDetailsFromId(request.apiClient, appealId);

	const mappedPageContents = addNeighbouringSitePage(
		appealsDetails,
		request.session.neighbouringSite,
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
export const postAddNeighbouringSite = async (request, response) => {
	request.session.neighbouringSite = {
		addressLine1: request.body['addressLine1'],
		addressLine2: request.body['addressLine2'] === '' ? null : request.body['addressLine2'],
		town: request.body['town'],
		county: request.body['county'] === '' ? null : request.body['county'],
		postCode: request.body['postCode']
	};

	if (request.errors) {
		return renderAddNeighbouringSite(request, response);
	}
	const {
		params: { appealId }
	} = request;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/neighbouring-sites/add/check-and-confirm`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddNeighbouringSiteCheckAndConfirm = async (request, response) => {
	return renderAddNeighbouringSiteCheckAndConfirm(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAddNeighbouringSiteCheckAndConfirm = async (request, response) => {
	const {
		errors,
		params: { appealId }
	} = request;

	if (!objectContainsAllKeys(request.session, 'neighbouringSite')) {
		return response.render('app/500.njk');
	}

	const appealData = await getAppealDetailsFromId(request.apiClient, appealId);

	if (!appealData) {
		return response.render('app/404.njk');
	}

	const mappedPageContent = addNeighbouringSiteCheckAndConfirmPage(
		appealData,
		request.session.neighbouringSite
	);

	return response.render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddNeighbouringSiteCheckAndConfirm = async (request, response) => {
	if (!objectContainsAllKeys(request.session, 'neighbouringSite')) {
		return response.render('app/500.njk');
	}

	const {
		params: { appealId }
	} = request;

	if (request.errors) {
		return renderAddNeighbouringSiteCheckAndConfirm(request, response);
	}

	try {
		await addNeighbouringSite(request.apiClient, appealId, request.session.neighbouringSite);

		addNotificationBannerToSession(
			request.session,
			'neighbouringSiteAdded',
			appealId,
			`<p class="govuk-notification-banner__heading">Inspector or third party neighbouring site added</p>`
		);

		delete request.session.neighbouringSite;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getManageNeighbouringSites = async (request, response) => {
	return renderManageNeighbouringSites(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderManageNeighbouringSites = async (request, response) => {
	const { appealId } = request.params;
	const appealData = await getAppealDetailsFromId(request.apiClient, appealId);

	const mappedPageContents = manageNeighbouringSitesPage(appealData);

	return response.render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContents
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getRemoveNeighbouringSite = async (request, response) => {
	return renderRemoveNeighbouringSite(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderRemoveNeighbouringSite = async (request, response) => {
	const {
		errors,
		params: { appealId, siteId }
	} = request;

	const appealsDetails = await getAppealDetailsFromId(request.apiClient, appealId);

	const mappedPageContents = removeNeighbouringSitePage(appealsDetails, siteId);

	return response.render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postRemoveNeighbouringSite = async (request, response) => {
	const {
		body,
		errors,
		params: { appealId, siteId }
	} = request;

	if (errors) {
		return getRemoveNeighbouringSite(request, response);
	}

	if (!body['remove-neighbouring-site'] || !appealId || !siteId) {
		return response.render('app/500.njk');
	}

	if (body['remove-neighbouring-site'] === 'no') {
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/neighbouring-sites/manage`
		);
	} else if (body['remove-neighbouring-site'] === 'yes') {
		await removeNeighbouringSite(request.apiClient, appealId, siteId);
		addNotificationBannerToSession(
			request.session,
			'neighbouringSiteRemoved',
			appealId,
			`<p class="govuk-notification-banner__heading">Inspector or third party neighbouring site removed</p>`
		);
		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	}
	return response.render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeNeighbouringSite = async (request, response) => {
	return renderChangeNeighbouringSite(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeNeighbouringSite = async (request, response) => {
	const {
		errors,
		params: { appealId, siteId }
	} = request;

	const appealDetails = await getAppealDetailsFromId(request.apiClient, appealId);

	const mappedPageContents = changeNeighbouringSitePage(
		appealDetails,
		request.session.neighbouringSite,
		siteId,
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
export const postChangeNeighbouringSite = async (request, response) => {
	request.session.neighbouringSite = {
		addressLine1: request.body['addressLine1'],
		addressLine2: request.body['addressLine2'] === '' ? null : request.body['addressLine2'],
		town: request.body['town'],
		county: request.body['county'] === '' ? null : request.body['county'],
		postCode: request.body['postCode']
	};

	if (request.errors) {
		return renderChangeNeighbouringSite(request, response);
	}
	const {
		params: { appealId, siteId }
	} = request;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/neighbouring-sites/change/${siteId}/check-and-confirm`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeNeighbouringSiteCheckAndConfirm = async (request, response) => {
	return renderChangeNeighbouringSiteCheckAndConfirm(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeNeighbouringSiteCheckAndConfirm = async (request, response) => {
	const {
		errors,
		params: { appealId, siteId }
	} = request;

	if (!objectContainsAllKeys(request.session, 'neighbouringSite')) {
		return response.render('app/500.njk');
	}

	const appealData = await getAppealDetailsFromId(request.apiClient, appealId);

	if (!appealData) {
		return response.render('app/404.njk');
	}

	const mappedPageContent = changeNeighbouringSiteCheckAndConfirmPage(
		appealData,
		request.session.neighbouringSite,
		siteId
	);

	return response.render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeNeighbouringSiteCheckAndConfirm = async (request, response) => {
	if (!objectContainsAllKeys(request.session, 'neighbouringSite')) {
		return response.render('app/500.njk');
	}

	const {
		params: { appealId, siteId }
	} = request;

	if (request.errors) {
		return renderChangeNeighbouringSiteCheckAndConfirm(request, response);
	}

	try {
		await changeNeighbouringSite(
			request.apiClient,
			appealId,
			request.session.neighbouringSite,
			siteId
		);

		addNotificationBannerToSession(
			request.session,
			'neighbouringSiteUpdated',
			appealId,
			`<p class="govuk-notification-banner__heading">Inspector or third party neighbouring site updated</p>`
		);

		delete request.session.neighbouringSite;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.render('app/500.njk');
};
