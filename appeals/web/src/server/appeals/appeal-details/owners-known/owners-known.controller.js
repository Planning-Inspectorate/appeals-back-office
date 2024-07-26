import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case/appellant-case.service.js';
import { changeOwnersKnownPage } from './owners-known.mapper.js';
import { changeOwnersKnown } from './owners-known.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeOwnersKnown = async (request, response) => {
	return renderChangeOwnersKnown(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeOwnersKnown = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeOwnersKnownPage(
			currentAppeal,
			appellantCaseData,
			request.session.ownersKnown
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
export const postChangeOwnersKnown = async (request, response) => {
	if (request.errors) {
		return renderChangeOwnersKnown(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	request.session.ownersKnown = {
		radio:
			request.body['ownersKnownRadio'] === 'not-applicable'
				? null
				: request.body['ownersKnownRadio']
	};

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeOwnersKnown(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.ownersKnown
		);

		addNotificationBannerToSession(
			request.session,
			'changePage',
			appealId,
			undefined,
			'Owners known updated'
		);

		delete request.session.ownersKnown;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
