import { constructUrl } from '#lib/mappers/utils/url.mapper.js';
import { supportingDocumentsPage } from './supporting-documents.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderSupportingDocuments = (request, response) => {
	const { currentAppeal, currentRepresentation, currentFolder, query } = request;

	if (!currentAppeal || !currentRepresentation) {
		return response.status(404).render('app/404.njk');
	}

	const backLinkUrl = query.backUrl
		? constructUrl(String(query.backUrl), currentAppeal.appealId)
		: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments`;

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: supportingDocumentsPage(
			currentAppeal,
			currentRepresentation,
			currentFolder,
			backLinkUrl
		)
	});
};
