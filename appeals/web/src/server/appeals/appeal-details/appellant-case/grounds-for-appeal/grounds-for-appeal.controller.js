import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeGroundsForAppealPage } from './grounds-for-appeal.mapper.js';
import { changeGroundsForAppeal, getAllGrounds } from './grounds-for-appeal.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeGroundsForAppeal = async (request, response) => {
	return renderChangeGroundsForAppeal(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeGroundsForAppeal = async (request, response) => {
	try {
		// @ts-ignore
		const { errors, currentAppeal } = request;

		const groundsForAppeal = await getAllGrounds(request.apiClient);

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const selectedGrounds = errors
			? []
			: // @ts-ignore
			  appellantCaseData.appealGrounds?.map((appealGround) => appealGround?.ground?.groundRef) ??
			  [];

		const mappedPageContents = changeGroundsForAppealPage(
			currentAppeal,
			selectedGrounds,
			// @ts-ignore
			groundsForAppeal,
			errors && typeof errors === 'object' ? errors.groundsForAppeal?.msg : undefined
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
export const postChangeGroundsForAppeal = async (request, response) => {
	if (request.errors) {
		return renderChangeGroundsForAppeal(request, response);
	}

	const {
		params: { appealId },
		currentAppeal,
		body: { groundsForAppeal }
	} = request;

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeGroundsForAppeal(
			request.apiClient,
			appealId,
			appellantCaseId,
			[groundsForAppeal].flat()
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Appeal updated'
		});

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
