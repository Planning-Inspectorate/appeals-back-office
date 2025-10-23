import logger from '#lib/logger.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeSiteGridReferencePage } from './grid-reference.mapper.js';
import { changeSiteGridReference } from './grid-reference.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeSiteGridReference = async (request, response) => {
	return renderChangeSiteGridReference(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeSiteGridReference = async (request, response) => {
	const { currentAppeal, apiClient, errors } = request;

	const appellantCaseData = await getAppellantCaseFromAppealId(
		apiClient,
		currentAppeal.appealId,
		currentAppeal.appellantCaseId
	);

	const mappedPageContents = changeSiteGridReferencePage(
		currentAppeal,
		appellantCaseData,
		request.session.siteGridReference,
		errors
	);

	delete request.session.siteGridReference;

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeSiteGridReference = async (request, response) => {
	const { currentAppeal, apiClient, errors } = request;
	const { appealId, appellantCaseId } = currentAppeal;
	request.session.siteGridReference = {
		siteGridReferenceEasting: request.body.siteGridReferenceEasting,
		siteGridReferenceNorthing: request.body.siteGridReferenceNorthing
	};

	if (errors) {
		return renderChangeSiteGridReference(request, response);
	}

	try {
		await changeSiteGridReference(
			apiClient,
			appealId,
			appellantCaseId,
			request.session.siteGridReference
		);

		delete request.session.siteGridReference;
		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		logger.error(error);

		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderChangeSiteGridReference(request, response);
		}
	}
	return response.status(500).render('app/500.njk');
};
