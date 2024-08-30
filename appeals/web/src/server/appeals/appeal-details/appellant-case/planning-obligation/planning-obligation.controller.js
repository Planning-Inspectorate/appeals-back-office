import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import {
	changePlanningObligationPage,
	changePlanningObligationStatusPage
} from './planning-obligation.mapper.js';
import {
	changePlanningObligation,
	changePlanningObligationStatus
} from './planning-obligation.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangePlanningObligation = async (request, response) => {
	return renderChangePlanningObligation(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangePlanningObligation = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changePlanningObligationPage(
			currentAppeal,
			appellantCaseData,
			request.session.planningObligation
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
export const postChangePlanningObligation = async (request, response) => {
	if (request.errors) {
		return renderChangePlanningObligation(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	request.session.planningObligation = {
		radio: request.body['planningObligationRadio'] === 'yes'
	};

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changePlanningObligation(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.planningObligation.radio
		);

		addNotificationBannerToSession(
			request.session,
			'changePage',
			appealId,
			'',
			'Planning obligation in support updated'
		);

		delete request.session.planningObligation;

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
export const getChangePlanningObligationStatus = async (request, response) => {
	return renderChangePlanningObligationStatus(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangePlanningObligationStatus = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changePlanningObligationStatusPage(
			currentAppeal,
			appellantCaseData,
			request.session.planningObligationStatus
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
export const postChangePlanningObligationStatus = async (request, response) => {
	if (request.errors) {
		return renderChangePlanningObligationStatus(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	request.session.planningObligationStatus = {
		radio:
			request.body['planningObligationStatusRadio'] === 'not-applicable'
				? null
				: request.body['planningObligationStatusRadio']
	};

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changePlanningObligationStatus(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.planningObligationStatus.radio
		);

		addNotificationBannerToSession(
			request.session,
			'changePage',
			appealId,
			'',
			'Planning obligation status updated'
		);

		delete request.session.planningObligationStatus;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
