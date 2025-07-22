import logger from '#lib/logger.js';
import { HTTPError } from 'got';
import { addNetResidence } from './net-residence.mapper.js';
import { changeNumberOfResidencesNetChange } from './net-residence.service.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
// import { getAppellantCaseFromAppealId } from '../appellant-case/appellant-case.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getNetResidence = async (request, response) => {
	return renderGetNetResidence(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderGetNetResidence = async (request, response) => {
	const { errors } = request;

	let {
		body: { 'net-residence': netResidence },
		body: { 'net-loss': netLoss },
		body: { 'net-gain': netGain }
	} = request;

	const appealsDetail = request.currentAppeal;

	const mappedPageContents = addNetResidence(appealsDetail, errors, netResidence, netLoss, netGain);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postNetResidence = async (request, response) => {
	const { errors } = request;

	if (errors) {
		return renderGetNetResidence(request, response);
	}

	const numberOfResidencesNetChange = request.body['net-residence'];

	switch (numberOfResidencesNetChange) {
		case 'gain':
			request.currentAppeal.numberOfResidencesNetChange = parseInt(request.body['net-gain']);
			break;
		case 'loss':
			request.currentAppeal.numberOfResidencesNetChange = parseInt(request.body['net-loss']) * -1;
			break;
		case 'noChange':
			request.currentAppeal.numberOfResidencesNetChange = 0;
	}

	try {
		await changeNumberOfResidencesNetChange(
			request.apiClient,
			request.currentAppeal.appealId,
			request.currentAppeal.appellantCaseId,
			request.currentAppeal.numberOfResidencesNetChange
		);
		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'netResidenceAdded',
			appealId: request.currentAppeal.appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${request.params.appealId}/`);
	} catch (error) {
		logger.error(error);

		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderGetNetResidence(request, response);
		}
	}
	return response.status(500).render('app/500.njk');
};
