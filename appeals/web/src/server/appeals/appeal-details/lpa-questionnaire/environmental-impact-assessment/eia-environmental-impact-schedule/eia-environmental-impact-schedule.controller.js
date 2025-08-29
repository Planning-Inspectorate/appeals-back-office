import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getLpaQuestionnaireFromId } from '../../lpa-questionnaire.service.js';
import {
	changeEiaEnvironmentalImpactSchedulePage,
	mapEiaEnvironmentalImpactScheduleRadioValueForService
} from './eia-environmental-impact-schedule.mapper.js';
import { changeEiaEnvironmentalImpactSchedule } from './eia-environmental-impact-schedule.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeEiaEnvironmentalImpactSchedule = async (request, response) => {
	const {
		errors,
		apiClient,
		params: { appealId, lpaQuestionnaireId }
	} = request;

	const lpaQuestionnaire = await getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId);

	const mappedPageContents = changeEiaEnvironmentalImpactSchedulePage(
		request.currentAppeal,
		lpaQuestionnaire.eiaEnvironmentalImpactSchedule
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
export const getChangeEiaEnvironmentalImpactSchedule = renderChangeEiaEnvironmentalImpactSchedule;

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeEiaEnvironmentalImpactSchedule = async (request, response) => {
	request.session.eiaEnvironmentalImpactSchedule = request.body['eiaEnvironmentalImpactSchedule'];

	if (request.errors) {
		return renderChangeEiaEnvironmentalImpactSchedule(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	try {
		await changeEiaEnvironmentalImpactSchedule(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			mapEiaEnvironmentalImpactScheduleRadioValueForService(
				request.session.eiaEnvironmentalImpactSchedule
			)
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Development category updated'
		});

		delete request.session.eiaEnvironmentalImpactSchedule;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
