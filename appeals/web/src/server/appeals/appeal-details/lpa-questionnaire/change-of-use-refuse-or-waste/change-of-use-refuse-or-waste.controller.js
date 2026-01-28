import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { areIdParamsValid } from '#lib/validators/id-param.validator.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { changeOfUseRefuseOrWastePage } from './change-of-use-refuse-or-waste.mapper.js';
import { changeOfUseRefuseOrWaste } from './change-of-use-refuse-or-waste.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeOfUseRefuseOrWaste = async (request, response) => {
	return renderChangeOfUseRefuseOrWaste(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeOfUseRefuseOrWaste = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeOfUseRefuseOrWastePage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.changeOfUseRefuseOrWaste
		);

		delete request.session.changeOfUseRefuseOrWaste;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.changeOfUseRefuseOrWaste;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeOfUseRefuseOrWaste = async (request, response) => {
	request.session.changeOfUseRefuseOrWaste = request.body['changeOfUseRefuseOrWasteRadio'];

	if (request.errors) {
		return renderChangeOfUseRefuseOrWaste(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	if (!areIdParamsValid(appealId, lpaQuestionnaireId)) {
		return response.status(400).render('app/400.njk');
	}

	try {
		await changeOfUseRefuseOrWaste(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.changeOfUseRefuseOrWaste
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Does the enforcement notice include a change of use of land to dispose refuse or waste materials has been updated'
		});

		delete request.session.changeOfUseRefuseOrWaste;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
