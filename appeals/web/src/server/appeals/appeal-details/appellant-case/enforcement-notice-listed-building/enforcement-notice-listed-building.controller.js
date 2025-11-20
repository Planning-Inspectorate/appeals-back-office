import { getAppellantCaseFromAppealId } from '#appeals/appeal-details/appellant-case/appellant-case.service.js';
import { changeEnforcementNoticeListedBuildingPage } from '#appeals/appeal-details/appellant-case/enforcement-notice-listed-building/enforcement-notice-listed-building.mapper.js';
import { changeEnforcementNoticeListedBuilding } from '#appeals/appeal-details/appellant-case/enforcement-notice-listed-building/enforcement-notice-listed-building.service.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeEnforcementNoticeListedBuilding = async (request, response) => {
	const { currentAppeal, apiClient } = request;

	const appellantCaseData = await getAppellantCaseFromAppealId(
		apiClient,
		currentAppeal.appealId,
		currentAppeal.appellantCaseId
	);

	const mappedPageContent = changeEnforcementNoticeListedBuildingPage(
		currentAppeal,
		appellantCaseData?.enforcementNotice?.isListedBuilding
	);

	try {
		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContent
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
export const postChangeEnforcementNoticeListedBuilding = async (request, response) => {
	const enforcementNoticeListedBuilding = request.body.enforcementNoticeListedBuilding === 'yes';
	const { appellantCaseId, appealId } = request.currentAppeal;

	try {
		await changeEnforcementNoticeListedBuilding(
			request.apiClient,
			appealId,
			appellantCaseId,
			enforcementNoticeListedBuilding
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
