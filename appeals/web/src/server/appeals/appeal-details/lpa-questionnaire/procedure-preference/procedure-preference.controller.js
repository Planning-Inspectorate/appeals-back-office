import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import {
	changeProcedurePreferenceDetailsPage,
	changeProcedurePreferenceDurationPage,
	changeProcedurePreferencePage
} from './procedure-preference.mapper.js';
import {
	changeProcedurePreference,
	changeProcedurePreferenceDetails,
	changeProcedurePreferenceDuration
} from './procedure-preference.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeProcedurePreference = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeProcedurePreferencePage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.procedurePreference
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
export const getChangeProcedurePreference = renderChangeProcedurePreference;

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeProcedurePreference = async (request, response) => {
	if (request.errors) {
		return renderChangeProcedurePreference(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	request.session.lpaProcedurePreference = {
		radio: request.body['procedurePreferenceRadio']
	};

	try {
		await changeProcedurePreference(
			request.apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			request.session.lpaProcedurePreference.radio
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Procedure preference updated'
		});

		delete request.session.lpaProcedurePreference;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${currentAppeal.lpaQuestionnaireId}`
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
const renderChangeProcedurePreferenceDetails = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeProcedurePreferenceDetailsPage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.procedurePreferenceDetails
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
export const getChangeProcedurePreferenceDetails = renderChangeProcedurePreferenceDetails;

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeProcedurePreferenceDetails = async (request, response) => {
	if (request.errors) {
		return renderChangeProcedurePreferenceDetails(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	request.session.lpaProcedurePreferenceDetails = {
		textarea: request.body['procedurePreferenceDetailsTextarea']
	};

	try {
		await changeProcedurePreferenceDetails(
			request.apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			request.session.lpaProcedurePreferenceDetails.textarea
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Reason for preference updated'
		});

		delete request.session.lpaProcedurePreferenceDetails;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${currentAppeal.lpaQuestionnaireId}`
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
const renderChangeProcedurePreferenceDuration = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeProcedurePreferenceDurationPage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.procedurePreferenceDuration
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
export const getChangeProcedurePreferenceDuration = renderChangeProcedurePreferenceDuration;

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeProcedurePreferenceDuration = async (request, response) => {
	if (request.errors) {
		return renderChangeProcedurePreferenceDuration(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	request.session.procedurePreferenceDuration = {
		input: request.body['procedurePreferenceDurationInput']
	};

	try {
		await changeProcedurePreferenceDuration(
			request.apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			request.session.procedurePreferenceDuration.input
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Expected length of procedure updated'
		});

		delete request.session.procedurePreferenceDuration;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${currentAppeal.lpaQuestionnaireId}`
		);
	} catch (error) {
		delete request.session.procedurePreferenceDuration;
		logger.error(error);
	}

	delete request.session.procedurePreferenceDuration;
	return response.status(500).render('app/500.njk');
};
