import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { logger } from '@azure/storage-blob';
import { writtenOrVerbalPermissionNoticePage } from './written-or-verbal-permission.mapper.js';
import { changeWrittenOrVerbalPermission } from './written-or-verbal-permission.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getWrittenOrVerbalPermission = async (request, response) => {
	return renderWrittenOrVerbalPermission(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderWrittenOrVerbalPermission = async (request, response) => {
	const { currentAppeal, errors } = request;
	const mappedPageContents = writtenOrVerbalPermissionNoticePage(currentAppeal);
	return response
		.status(errors ? 400 : 200)
		.render('patterns/change-page.pattern.njk', { pageContent: mappedPageContents, errors });
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postWrittenOrVerbalPermission = async (request, response) => {
	const { currentAppeal, errors } = request;

	if (errors) {
		return renderWrittenOrVerbalPermission(request, response);
	}

	const radioSelection = request.body['writtenOrVerbalPermission'];
	const { appealId, appellantCaseId } = currentAppeal;

	try {
		await changeWrittenOrVerbalPermission(
			request.apiClient,
			appealId,
			appellantCaseId,
			radioSelection
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
	}

	return response.status(500).render('app/500.njk');
};
