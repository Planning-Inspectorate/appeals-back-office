import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import {
	changeInquiryNumberOfWitnessesPage,
	changeProcedurePreferenceDetailsPage,
	changeProcedurePreferenceDurationPage,
	changeProcedurePreferencePage
} from './procedure-preference.mapper.js';
import {
	changeInquiryNumberOfWitnesses,
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

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeProcedurePreferencePage(
			currentAppeal,
			appellantCaseData,
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

	request.session.procedurePreference = {
		radio: request.body['procedurePreferenceRadio']
	};

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeProcedurePreference(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.procedurePreference.radio
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Procedure preference updated'
		});

		delete request.session.procedurePreference;

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
const renderChangeProcedurePreferenceDetails = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeProcedurePreferenceDetailsPage(
			currentAppeal,
			appellantCaseData,
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

	request.session.procedurePreferenceDetails = {
		textarea: request.body['procedurePreferenceDetailsTextarea']
	};

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeProcedurePreferenceDetails(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.procedurePreferenceDetails.textarea
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Reason for preference updated'
		});

		delete request.session.procedurePreferenceDetails;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);

		// Check if it's a validation error (400)
		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderChangeProcedurePreferenceDetails(request, response);
		}
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

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeProcedurePreferenceDurationPage(
			currentAppeal,
			appellantCaseData,
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

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeProcedurePreferenceDuration(
			request.apiClient,
			appealId,
			appellantCaseId,
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
const renderChangeInquiryNumberOfWitnesses = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeInquiryNumberOfWitnessesPage(
			currentAppeal,
			appellantCaseData,
			request.session.inquiryNumberOfWitnesses
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
export const getChangeInquiryNumberOfWitnesses = renderChangeInquiryNumberOfWitnesses;

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInquiryNumberOfWitnesses = async (request, response) => {
	if (request.errors) {
		return renderChangeInquiryNumberOfWitnesses(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	request.session.inquiryNumberOfWitnesses = {
		input: request.body['inquiryNumberOfWitnessesInput']
	};

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeInquiryNumberOfWitnesses(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.inquiryNumberOfWitnesses.input
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Expected number of witnesses updated'
		});

		delete request.session.inquiryNumberOfWitnesses;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
