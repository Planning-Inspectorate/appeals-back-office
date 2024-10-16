import logger from '#lib/logger.js';
import {
	changeEiaColumnTwoThresholdPage,
	changeEiaRequiresEnvironmentalStatementPage
} from './environmental-impact-assessment.mapper.js';
import {
	changeEiaColumnTwoThreshold,
	changeEiaRequiresEnvironmentalStatement
} from './environmental-impact-assessment.service.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeEiaColumnTwoThreshold = async (request, response) => {
	return renderChangeEiaColumnTwoThreshold(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeEiaColumnTwoThreshold = async (request, response) => {
	const {
		errors,
		apiClient,
		params: { appealId, lpaQuestionnaireId }
	} = request;

	const lpaQuestionnaire = await getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId);

	const mappedPageContents = changeEiaColumnTwoThresholdPage(
		request.currentAppeal,
		lpaQuestionnaire.eiaColumnTwoThreshold
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
export const postChangeEiaColumnTwoThreshold = async (request, response) => {
	request.session.eiaColumnTwoThreshold = request.body['eiaColumnTwoThreshold'];

	if (request.errors) {
		return renderChangeEiaColumnTwoThreshold(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	try {
		await changeEiaColumnTwoThreshold(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.eiaColumnTwoThreshold
		);

		addNotificationBannerToSession(
			request.session,
			'changePage',
			appealId,
			'',
			'Column 2 threshold criteria status changed'
		);

		delete request.session.eiaColumnTwoThreshold;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
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
export const getChangeEiaRequiresEnvironmentalStatement = async (request, response) => {
	return renderChangeEiaRequiresEnvironmentalStatement(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeEiaRequiresEnvironmentalStatement = async (request, response) => {
	const {
		errors,
		apiClient,
		params: { appealId, lpaQuestionnaireId }
	} = request;

	const lpaQuestionnaire = await getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId);

	const mappedPageContents = changeEiaRequiresEnvironmentalStatementPage(
		request.currentAppeal,
		lpaQuestionnaire.eiaRequiresEnvironmentalStatement
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
export const postChangeEiaRequiresEnvironmentalStatement = async (request, response) => {
	request.session.eiaRequiresEnvironmentalStatement =
		request.body['eiaRequiresEnvironmentalStatement'];

	if (request.errors) {
		return renderChangeEiaRequiresEnvironmentalStatement(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	try {
		await changeEiaRequiresEnvironmentalStatement(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.eiaRequiresEnvironmentalStatement
		);

		addNotificationBannerToSession(
			request.session,
			'changePage',
			appealId,
			'',
			'Environmental statement status changed'
		);

		delete request.session.eiaRequiresEnvironmentalStatement;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
