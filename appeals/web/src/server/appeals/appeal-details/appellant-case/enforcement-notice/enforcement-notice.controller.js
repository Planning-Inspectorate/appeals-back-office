import { getAppellantCaseFromAppealId } from '#appeals/appeal-details/appellant-case/appellant-case.service.js';
import { changeEnforcementNoticePage } from '#appeals/appeal-details/appellant-case/enforcement-notice/enforcement-notice.mapper.js';
import { changeEnforcementNotice } from '#appeals/appeal-details/appellant-case/enforcement-notice/enforcement-notice.service.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeEnforcementNotice = async (request, response) => {
	const { currentAppeal, apiClient } = request;

	const appellantCaseData = await getAppellantCaseFromAppealId(
		apiClient,
		currentAppeal.appealId,
		currentAppeal.appellantCaseId
	);

	const mappedPageContent = changeEnforcementNoticePage(
		currentAppeal,
		appellantCaseData?.enforcementNotice?.isReceived
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
export const postChangeEnforcementNotice = async (request, response) => {
	const enforcementNotice = request.body.enforcementNotice === 'yes';
	const { appellantCaseId, appealId } = request.currentAppeal;

	try {
		await changeEnforcementNotice(request.apiClient, appealId, appellantCaseId, enforcementNotice);

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
