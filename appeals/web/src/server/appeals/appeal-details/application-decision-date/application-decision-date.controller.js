import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case/appellant-case.service.js';
import {
	changeApplicationHasDecisionDatePage,
	changeApplicationSetDecisionDatePage
} from './application-decision-date.mapper.js';
import { changeApplicationDecisionDate } from './application-decision-date.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeApplicationHasDecisionDate = async (request, response) => {
	return renderChangeApplicationHasDecisionDate(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeApplicationHasDecisionDate = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;
		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeApplicationHasDecisionDatePage(
			currentAppeal,
			appellantCaseData,
			request.session.applicationDecisionDate
		);

		delete request.session.applicationDecisionDate;

		return response
			.status(200)
			.render('patterns/change-page.pattern.njk', { pageContent: mappedPageContents, errors });
	} catch (error) {
		logger.error(error);
		delete request.session.applicationDecisionDate;
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
export const postChangeApplicationHasDecisionDate = async (request, response) => {
	if (request.errors) {
		return renderChangeApplicationHasDecisionDate(request, response);
	}

	try {
		const radio = request.body['application-decision-radio'];
		const { currentAppeal, apiClient } = request;

		const { appealId, appellantCaseId } = currentAppeal;
		if (radio === 'yes') {
			request.session.applicationDecisionDate = {
				radio: radio
			};
			return response.redirect(`${request.originalUrl}/set-date`);
		} else {
			await changeApplicationDecisionDate(apiClient, appealId, appellantCaseId, null);

			addNotificationBannerToSession(
				request.session,
				'changePage',
				appealId,
				undefined,
				'Application decision date removed'
			);

			delete request.session.applicationDecisionDate;

			return response.redirect(
				`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
			);
		}
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeApplicationSetDecisionDate = async (request, response) => {
	return renderChangeApplicationSetDecisionDate(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeApplicationSetDecisionDate = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;
		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeApplicationSetDecisionDatePage(
			currentAppeal,
			appellantCaseData,
			request.session.applicationDecisionDate
		);

		return response
			.status(200)
			.render('patterns/change-page.pattern.njk', { pageContent: mappedPageContents, errors });
	} catch (error) {
		logger.error(error);
		delete request.session.applicationDecisionDate;
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
export const postChangeApplicationSetDecisionDate = async (request, response) => {
	request.session.applicationDecisionDate = {
		...request.session.applicationDecisionDate,
		day: request.body['application-decision-date-day'],
		month: request.body['application-decision-date-month'],
		year: request.body['application-decision-date-year']
	};

	if (request.errors) {
		return renderChangeApplicationSetDecisionDate(request, response);
	}

	try {
		const { currentAppeal, apiClient, session } = request;

		const { appealId, appellantCaseId } = currentAppeal;

		const updatedApplicationDecisionDay = parseInt(session.applicationDecisionDate.day, 10);
		const updatedApplicationDecisionMonth = parseInt(session.applicationDecisionDate.month, 10);
		const updatedApplicationDecisionYear = parseInt(session.applicationDecisionDate.year, 10);

		if (
			Number.isNaN(updatedApplicationDecisionDay) ||
			Number.isNaN(updatedApplicationDecisionMonth) ||
			Number.isNaN(updatedApplicationDecisionYear)
		) {
			return response.status(400).render('app/500.njk');
		}

		const updatedApplicationDecisionDayString = updatedApplicationDecisionDay
			.toString()
			.padStart(2, '0');
		const updatedApplicationDecisionMonthString = updatedApplicationDecisionMonth
			.toString()
			.padStart(2, '0');

		await changeApplicationDecisionDate(
			apiClient,
			appealId,
			appellantCaseId,
			`${updatedApplicationDecisionYear}-${updatedApplicationDecisionMonthString}-${updatedApplicationDecisionDayString}`
		);

		addNotificationBannerToSession(
			request.session,
			'changePage',
			appealId,
			undefined,
			'Application decision date updated'
		);

		delete request.session.applicationDecisionDate;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
