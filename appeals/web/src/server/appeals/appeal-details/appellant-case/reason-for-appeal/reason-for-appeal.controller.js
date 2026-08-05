import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { reasonForAppealPage } from './reason-for-appeal.mapper.js';
import { changeReasonForAppeal } from './reason-for-appeal.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getReasonForAppeal = async (request, response) => {
	return renderReasonForAppeal(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderReasonForAppeal = async (request, response) => {
	const { currentAppeal, apiClient, errors } = request;

	const appellantCaseData = await getAppellantCaseFromAppealId(
		apiClient,
		currentAppeal.appealId,
		currentAppeal.appellantCaseId
	);

	const mappedPageContents = reasonForAppealPage(
		currentAppeal,
		appellantCaseData,
		request.session.reasonForAppealAppellant
	);

	delete request.session.reasonForAppealAppellant;

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postReasonForAppeal = async (request, response) => {
	request.session.reasonForAppealAppellant = request.body['reasonForAppealAppellant'];
	const { currentAppeal, apiClient, errors } = request;
	const { appealId, appellantCaseId } = currentAppeal;
	if (errors) {
		return renderReasonForAppeal(request, response);
	}

	try {
		await changeReasonForAppeal(
			apiClient,
			appealId,
			appellantCaseId,
			request.session.reasonForAppealAppellant
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Reasons for your appeal updated'
		});
		delete request.session.reasonForAppealAppellant;
		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		logger.error(error);

		// Check if it's a validation error (400)
		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderReasonForAppeal(request, response);
		}
	}
	return response.status(500).render('app/500.njk');
};
