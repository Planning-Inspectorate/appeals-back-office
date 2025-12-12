import { getAppellantCaseFromAppealId } from '#appeals/appeal-details/appellant-case/appellant-case.service.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { changeAllegedBreachDescriptionPage } from './alleged-breach-description.mapper.js';
import { changeAllegedBreachDescription } from './alleged-breach-description.service.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderChangeAllegedBreachDescription = async (request, response) => {
	const { currentAppeal, apiClient, errors, body } = request;

	let descriptionOfAllegedBreach = body?.descriptionOfAllegedBreach;

	if (!errors) {
		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);
		descriptionOfAllegedBreach = appellantCaseData?.enforcementNotice?.descriptionOfAllegedBreach;
	}

	const mappedPageContent = changeAllegedBreachDescriptionPage(
		currentAppeal,
		descriptionOfAllegedBreach,
		errors
	);

	try {
		return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	} catch (error) {
		logger.error(error);
	}

	response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeAllegedBreachDescription = async (request, response) => {
	if (request.errors) {
		return renderChangeAllegedBreachDescription(request, response);
	}

	const { appellantCaseId, appealId } = request.currentAppeal;
	const { descriptionOfAllegedBreach } = request.body;

	try {
		await changeAllegedBreachDescription(
			request.apiClient,
			appealId,
			appellantCaseId,
			descriptionOfAllegedBreach
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Appeal updated'
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		logger.error(error);

		response.status(500).render('app/500.njk');
	}
};
