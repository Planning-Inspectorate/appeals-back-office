import {
	addNeighbouringSiteCheckAndConfirmPage,
	addNeighbouringSitePage,
	changeNeighbouringSiteAffectedPage,
	changeNeighbouringSiteCheckAndConfirmPage,
	changeNeighbouringSitePage,
	manageNeighbouringSitesPage,
	removeNeighbouringSitePage
} from './neighbouring-sites.mapper.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import {
	addNeighbouringSite,
	changeNeighbouringSite,
	changeNeighbouringSiteAffected,
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
		params: { source }
	} = request;

	const currentUrl = request.originalUrl;

	//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
	const origin = currentUrl.split('/').slice(0, -3).join('/');

	const appealsDetail = request.currentAppeal;

	const mappedPageContents = addNeighbouringSitePage(
		appealsDetail,
		// @ts-ignore
		source,
		origin,
		request.session.neighbouringSite,
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
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

	const currentUrl = request.originalUrl;

	//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
	const origin = currentUrl.split('/').slice(0, -3).join('/');

	if (request.errors) {
		return renderAddNeighbouringSite(request, response);
	}
	const {
		params: { source }
	} = request;

	return response.redirect(`${origin}/neighbouring-sites/add/${source}/check-and-confirm`);
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
		params: { source }
	} = request;

	if (!objectContainsAllKeys(request.session, 'neighbouringSite')) {
		return response.status(500).render('app/500.njk');
	}

	const appealData = request.currentAppeal;

	if (!appealData) {
		return response.status(404).render('app/404.njk');
	}

	const currentUrl = request.originalUrl;

	//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
	const origin = currentUrl.split('/').slice(0, -4).join('/');

	const mappedPageContent = addNeighbouringSiteCheckAndConfirmPage(
		appealData,
		// @ts-ignore
		source,
		origin,
		request.session.neighbouringSite
	);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
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
		return response.status(500).render('app/500.njk');
	}

	const {
		params: { appealId, source }
	} = request;

	if (request.errors) {
		return renderAddNeighbouringSiteCheckAndConfirm(request, response);
	}

	const currentUrl = request.originalUrl;

	//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
	const origin = currentUrl.split('/').slice(0, -4).join('/');

	try {
		await addNeighbouringSite(
			request.apiClient,
			appealId,
			source,
			request.session.neighbouringSite
		);
		addNotificationBannerToSession(
			request.session,
			'neighbouringSiteAdded',
			appealId,
			`<p class="govuk-notification-banner__heading">Neighbouring site added</p>`
		);

		delete request.session.neighbouringSite;

		return response.redirect(origin);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
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
	const appealData = request.currentAppeal;

	const mappedPageContents = manageNeighbouringSitesPage(appealData);

	return response.status(200).render('patterns/display-page.pattern.njk', {
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
		params: { siteId }
	} = request;

	const currentUrl = request.originalUrl;

	//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
	const origin = currentUrl.split('/').slice(0, -4).join('/');

	const appealDetails = request.currentAppeal;

	const mappedPageContents = removeNeighbouringSitePage(appealDetails, origin, siteId);

	return response.status(200).render('patterns/change-page.pattern.njk', {
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
		return response.status(500).render('app/500.njk');
	}

	const currentUrl = request.originalUrl;

	//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
	const origin = currentUrl.split('/').slice(0, -4).join('/');

	if (body['remove-neighbouring-site'] === 'no') {
		return response.redirect(`${origin}/neighbouring-sites/manage`);
	} else if (body['remove-neighbouring-site'] === 'yes') {
		await removeNeighbouringSite(request.apiClient, appealId, siteId);
		addNotificationBannerToSession(
			request.session,
			'neighbouringSiteRemoved',
			appealId,
			`<p class="govuk-notification-banner__heading">Neighbouring site removed</p>`
		);
		return response.redirect(origin);
	}
	return response.status(500).render('app/500.njk');
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
		params: { siteId }
	} = request;

	const appealDetails = request.currentAppeal;

	const mappedPageContents = changeNeighbouringSitePage(
		appealDetails,
		request.session.neighbouringSite,
		siteId,
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
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
		`/appeals-service/appeal-details/${appealId}/neighbouring-sites/change/site/${siteId}/check-and-confirm`
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
		params: { siteId }
	} = request;

	if (!objectContainsAllKeys(request.session, 'neighbouringSite')) {
		return response.status(500).render('app/500.njk');
	}

	const appealData = request.currentAppeal;

	if (!appealData) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = changeNeighbouringSiteCheckAndConfirmPage(
		appealData,
		request.session.neighbouringSite,
		siteId
	);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
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
		return response.status(500).render('app/500.njk');
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
			`<p class="govuk-notification-banner__heading">Neighbouring site updated</p>`
		);

		delete request.session.neighbouringSite;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeNeighbouringSiteAffected = async (request, response) => {
	return renderChangeNeighbouringSiteAffected(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeNeighbouringSiteAffected = async (request, response) => {
	const { errors } = request;

	const appealData = request.currentAppeal;

	const currentUrl = request.originalUrl;

	//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
	const origin = currentUrl.split('/').slice(0, -3).join('/');

	if (!appealData) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = changeNeighbouringSiteAffectedPage(appealData, origin);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeNeighbouringSiteAffected = async (request, response) => {
	const {
		params: { appealId },
		body: { neighbouringSiteAffected }
	} = request;

	if (request.errors) {
		return renderChangeNeighbouringSiteAffected(request, response);
	}

	try {
		const appealData = request.currentAppeal;
		const lpaQuestionnaireId = appealData.lpaQuestionnaireId?.toString();

		//Removes /neighbouring-sites/change/affected from the route to take us back to origin (ie LPA questionnaire page or appeals details)
		const currentUrl = request.originalUrl;
		const origin = currentUrl.split('/').slice(0, -3).join('/');

		await changeNeighbouringSiteAffected(
			request.apiClient,
			appealId,
			lpaQuestionnaireId,
			neighbouringSiteAffected
		);

		addNotificationBannerToSession(
			request.session,
			'neighbouringSiteAffected',
			appealId,
			`<p class="govuk-notification-banner__heading">Neighbouring site affected status updated</p>`
		);

		delete request.session.neighbouringSite;

		return response.redirect(origin);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
