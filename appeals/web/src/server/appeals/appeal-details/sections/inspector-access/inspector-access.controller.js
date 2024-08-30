import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { changeInspectorAccessPage } from './inspector-access.mapper.js';
import {
	changeAppellantInspectorAccess,
	changeLpaInspectorAccess
} from './inspector-access.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInspectorAccess = async (request, response) => {
	return renderChangeInspectorAccess(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeInspectorAccess = async (request, response) => {
	try {
		const {
			errors,
			params: { source }
		} = request;

		const currentUrl = request.originalUrl;

		const origin = currentUrl.split('/').slice(0, -3).join('/');

		const appealDetails = request.currentAppeal;

		const mappedPageContents = changeInspectorAccessPage(
			appealDetails,
			request.session.inspectorAccess,
			origin,
			source
		);

		delete request.session.inspectorAccess;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.inspectorAccess;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInspectorAccess = async (request, response) => {
	request.session.inspectorAccess = {
		radio: request.body['inspectorAccessRadio'],
		details: request.body['inspectorAccessDetails']
	};

	if (request.errors) {
		return renderChangeInspectorAccess(request, response);
	}

	const {
		params: { appealId, source }
	} = request;

	const currentUrl = getOriginPathname(request);
	const appealDetails = request.currentAppeal;

	const origin = currentUrl.split('/').slice(0, -3).join('/');

	if (!isInternalUrl(origin, request)) {
		return response.status(400).render('errorPageTemplate', {
			message: 'Invalid redirection attempt detected.'
		});
	}

	try {
		if (source === 'lpa') {
			await changeLpaInspectorAccess(
				request.apiClient,
				appealId,
				appealDetails.lpaQuestionnaireId,
				request.session.inspectorAccess
			);
		} else {
			await changeAppellantInspectorAccess(
				request.apiClient,
				appealId,
				appealDetails.appellantCaseId,
				request.session.inspectorAccess
			);
		}

		addNotificationBannerToSession(
			request.session,
			'changePage',
			appealId,
			`<p class="govuk-notification-banner__heading">Inspector access (${source}) updated</p>`
		);

		delete request.session.inspectorAccess;

		return response.redirect(origin);
	} catch (error) {
		logger.error(error);
		delete request.session.inspectorAccess;
	}

	return response.status(500).render('app/500.njk');
};
