import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeLandownerPermissionPage } from './landowner-permission.mapper.js';
import { changeLandownerPermission } from './landowner-permission.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeLandownerPermission = async (request, response) => {
	return renderChangeLandownerPermission(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeLandownerPermission = async (request, response) => {
	try {
		const { currentAppeal, apiClient, errors } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeLandownerPermissionPage(
			currentAppeal,
			appellantCaseData,
			request.session.landownerPermission
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);

		if (error instanceof HTTPError && error.response.statusCode === 404) {
			return response.status(404).render('app/404.njk');
		} else {
			return response.status(500).render('app/500.njk');
		}
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeLandownerPermission = async (request, response) => {
	if (request.errors) {
		return renderChangeLandownerPermission(request, response);
	}

	const {
		params: { appealId },
		currentAppeal,
		apiClient
	} = request;

	request.session.landownerPermission = {
		radio: request.body.landownerPermission === 'yes'
	};

	try {
		await changeLandownerPermission(
			apiClient,
			appealId,
			currentAppeal.appellantCaseId,
			request.session.landownerPermission.radio
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Appeal updated'
		});

		delete request.session.landownerPermission;
		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
