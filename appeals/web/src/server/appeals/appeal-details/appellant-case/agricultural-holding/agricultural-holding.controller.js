import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import {
	changeOtherTenantsOfAgriculturalHoldingPage,
	changePartOfAgriculturalHoldingPage,
	changeTenantOfAgriculturalHoldingPage
} from './agricultural-holding.mapper.js';
import {
	changeOtherTenantsOfAgriculturalHolding,
	changePartOfAgriculturalHolding,
	changeTenantOfAgriculturalHolding
} from './agricultural-holding.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangePartOfAgriculturalHolding = async (request, response) => {
	return renderChangePartOfAgriculturalHolding(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangePartOfAgriculturalHolding = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changePartOfAgriculturalHoldingPage(
			currentAppeal,
			appellantCaseData,
			request.session.partOfAgriculturalHolding
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);

		if (error instanceof HTTPError && error.response.statusCode === 404) {
			return response.status(404).render('app/404.njk');
		} else {
			return response.status(500).render('app/500.njk');
		}
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangePartOfAgriculturalHolding = async (request, response) => {
	if (request.errors) {
		return renderChangePartOfAgriculturalHolding(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	request.session.partOfAgriculturalHolding = {
		radio: request.body['partOfAgriculturalHoldingRadio'] === 'yes'
	};

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changePartOfAgriculturalHolding(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.partOfAgriculturalHolding.radio
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Part of agricultural holding updated'
		});

		delete request.session.partOfAgriculturalHolding;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeTenantOfAgriculturalHolding = async (request, response) => {
	return renderChangeTenantOfAgriculturalHolding(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeTenantOfAgriculturalHolding = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeTenantOfAgriculturalHoldingPage(
			currentAppeal,
			appellantCaseData,
			request.session.tenantOfAgriculturalHolding
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);

		if (error instanceof HTTPError && error.response.statusCode === 404) {
			return response.status(404).render('app/404.njk');
		} else {
			return response.status(500).render('app/500.njk');
		}
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeTenantOfAgriculturalHolding = async (request, response) => {
	if (request.errors) {
		return renderChangeTenantOfAgriculturalHolding(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	request.session.tenantOfAgriculturalHolding = {
		radio: request.body['tenantOfAgriculturalHoldingRadio'] === 'yes'
	};

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeTenantOfAgriculturalHolding(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.tenantOfAgriculturalHolding.radio
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Tenant of agricultural holding updated'
		});

		delete request.session.tenantOfAgriculturalHolding;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeOtherTenantsOfAgriculturalHolding = async (request, response) => {
	return renderChangeOtherTenantsOfAgriculturalHolding(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeOtherTenantsOfAgriculturalHolding = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeOtherTenantsOfAgriculturalHoldingPage(
			currentAppeal,
			appellantCaseData,
			request.session.otherTenantsOfAgriculturalHolding
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);

		if (error instanceof HTTPError && error.response.statusCode === 404) {
			return response.status(404).render('app/404.njk');
		} else {
			return response.status(500).render('app/500.njk');
		}
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeOtherTenantsOfAgriculturalHolding = async (request, response) => {
	if (request.errors) {
		return renderChangeOtherTenantsOfAgriculturalHolding(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	request.session.otherTenantsOfAgriculturalHolding = {
		radio: request.body['otherTenantsOfAgriculturalHoldingRadio'] === 'yes'
	};

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeOtherTenantsOfAgriculturalHolding(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.otherTenantsOfAgriculturalHolding.radio
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Other tenants of agricultural holding updated'
		});

		delete request.session.otherTenantsOfAgriculturalHolding;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
