import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { logger } from '@azure/storage-blob';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { manageSignificantChangesPage } from './any-significant-changes.mapper.js';
import { changeSignificantChanges } from './any-significant-changes.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeSignificantChanges = async (request, response) => {
	return renderChangeSignificantChanges(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeSignificantChanges = async (request, response) => {
	const { currentAppeal, errors } = request;
	try {
		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);
		const mappedPageContents = manageSignificantChangesPage(currentAppeal, appellantCaseData);
		return response
			.status(errors ? 400 : 200)
			.render('patterns/change-page.pattern.njk', { pageContent: mappedPageContents, errors });
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeSignificantChanges = async (request, response) => {
	const { currentAppeal, errors, body } = request;

	if (errors) {
		return renderChangeSignificantChanges(request, response);
	}

	const radioSelection = body['anySignificantChangesRadio'];
	const { appealId, appellantCaseId } = currentAppeal;

	try {
		await changeSignificantChanges(request.apiClient, appealId, appellantCaseId, radioSelection);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Significant changes updated'
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
