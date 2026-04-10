import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeEiaScreeningPage } from './eia-screening.mapper.js';
import { updateEiaScreening } from './eia-screening.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeEiaScreening = async (request, response) => {
	return renderChangeEiaScreening(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeEiaScreening = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeEiaScreeningPage(
			currentAppeal,
			appellantCaseData,
			request.session.eiaScreening
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeEiaScreening = async (request, response) => {
	const {
		params: { appealId },
		currentAppeal
	} = request;

	if (request.errors) {
		return renderChangeEiaScreening(request, response);
	}

	request.session.eiaScreening = {
		radio: request.body['eiaScreeningRadio'] === 'yes'
	};

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await updateEiaScreening(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.eiaScreening.radio
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Environmental statement updated'
		});

		delete request.session.eiaScreening;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
