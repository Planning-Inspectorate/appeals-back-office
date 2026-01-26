import { getAppellantCaseFromAppealId } from '#appeals/appeal-details/appellant-case/appellant-case.service.js';
import { changeEnforcementReferencePage } from '#appeals/appeal-details/appellant-case/enforcement-reference/enforcement-reference.mapper.js';
import { changeEnforcementReference } from '#appeals/appeal-details/appellant-case/enforcement-reference/enforcement-reference.service.js';
import logger from '#lib/logger.js';
import { getSavedBackUrl } from '#lib/middleware/save-back-url.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderChangeEnforcementReference = async (request, response) => {
	const { currentAppeal, apiClient, errors, body } = request;

	let enforcementReference = body?.enforcementReference;

	if (!errors) {
		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);
		enforcementReference = appellantCaseData?.enforcementNotice?.reference;
	}

	const backUrl = getSavedBackUrl(request, 'changeEnforcementReference');

	const mappedPageContent = changeEnforcementReferencePage(
		currentAppeal,
		enforcementReference,
		errors,
		backUrl
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
export const postChangeEnforcementReference = async (request, response) => {
	if (request.errors) {
		return renderChangeEnforcementReference(request, response);
	}

	const { appellantCaseId, appealId } = request.currentAppeal;
	const { enforcementReference } = request.body;

	try {
		await changeEnforcementReference(
			request.apiClient,
			appealId,
			appellantCaseId,
			enforcementReference
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Enforcement reference updated'
		});

		const backUrl = getSavedBackUrl(request, 'changeEnforcementReference');

		return response.redirect(
			backUrl ?? `/appeals-service/appeal-details/${appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);

		response.status(500).render('app/500.njk');
	}
};
