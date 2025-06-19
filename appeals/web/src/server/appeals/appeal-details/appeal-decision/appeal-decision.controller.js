import { getFileVersionsInfo } from '#appeals/appeal-documents/appeal.documents.service.js';
import { mapNotificationBannersFromSession } from '#lib/mappers/index.js';
import { appealDecisionPage } from './appeal-decision.mapper.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getAppealDecision = async (request, response) => {
	renderAppealDecision(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAppealDecision = async (request, response) => {
	const { currentAppeal } = request;

	const { latestDocumentVersion: latestFileVersion, allVersions = [] } =
		(await getFileVersionsInfo(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.decision.documentId
		)) || {};

	const originalDocumentDate = allVersions[0]?.dateReceived;
	const mappedPageContent = appealDecisionPage(
		currentAppeal.appealId,
		currentAppeal.appealReference,
		currentAppeal.decision,
		originalDocumentDate,
		latestFileVersion?.version || 1
	);

	const notificationBanners = mapNotificationBannersFromSession(
		request.session,
		'appealDecision',
		currentAppeal.appealId
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: {
			...mappedPageContent,
			pageComponents: [...(mappedPageContent.pageComponents || []), ...notificationBanners]
		}
	});
};
