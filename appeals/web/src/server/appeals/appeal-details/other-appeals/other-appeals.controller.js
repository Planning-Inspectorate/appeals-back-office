import logger from '#lib/logger.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { HTTPError } from 'got';
import {
	addOtherAppealsPage,
	confirmOtherAppealsPage,
	manageOtherAppealsPage,
	removeAppealRelationshipPage
} from './other-appeals.mapper.js';
import {
	postAssociateAppeal,
	postAssociateLegacyAppeal,
	postUnrelateRequest
} from './other-appeals.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddOtherAppeals = async (request, response) => {
	return renderAddOtherAppeals(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddOtherAppeals = async (request, response) => {
	const addOtherAppealsReference = request.body.addOtherAppealsReference.trim();
	const {
		errors,
		params: { appealId }
	} = request;

	if (addOtherAppealsReference === undefined) {
		return response.status(500).render('app/500.njk');
	}

	if (errors) {
		return renderAddOtherAppeals(request, response, addOtherAppealsReference, errors);
	}

	if (request.body.problemWithHorizon) {
		return response.status(500).render('app/500.njk', {
			titleCopy: 'Sorry, there is a problem with Horizon',
			additionalCtas: [
				{
					href: `/appeals-service/appeal-details/${appealId}`,
					text: 'Go back to case overview'
				}
			],
			hideDefaultCta: true
		});
	}

	const currentUrl = getOriginPathname(request);
	const origin = currentUrl.split('/').slice(0, -2).join('/');

	if (!isInternalUrl(origin, request)) {
		return response.status(400).render('errorPageTemplate', {
			message: 'Invalid redirection attempt detected.'
		});
	}

	request.session.appealId = request.currentAppeal.appealId;
	request.session.relatedAppealReference = addOtherAppealsReference;

	return response.redirect(`${origin}/other-appeals/confirm`);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string | undefined} appealReferenceInputValue
 * @param {import('@pins/express/types/express.js').ValidationErrors | undefined} errors
 */
const renderAddOtherAppeals = async (
	request,
	response,
	appealReferenceInputValue = '',
	errors = undefined
) => {
	if (request.session.appealId && request.session.appealId !== request.currentAppeal.appealId) {
		delete request.session.appealId;
		delete request.session.relatedAppealReference;
	}
	const currentUrl = request.originalUrl;

	const origin = currentUrl.split('/').slice(0, -2).join('/');

	const mappedPageContent = await addOtherAppealsPage(
		request.currentAppeal,
		appealReferenceInputValue,
		origin,
		errors?.addOtherAppealsReference?.msg
			? { msg: errors?.addOtherAppealsReference?.msg }
			: undefined
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors: request.errors || errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getConfirmOtherAppeals = async (request, response) => {
	return renderConfirmOtherAppeals(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postConfirmOtherAppeals = async (request, response) => {
	const { errors } = request;

	if (errors) {
		return renderConfirmOtherAppeals(request, response, errors);
	}

	const { relateAppealsAnswer } = request.body;

	const currentUrl = getOriginPathname(request);
	const origin = currentUrl.split('/').slice(0, -2).join('/');

	if (!isInternalUrl(origin, request)) {
		return response.status(400).render('errorPageTemplate', {
			message: 'Invalid redirection attempt detected.'
		});
	}

	if (
		!objectContainsAllKeys(request.session, [
			'appealId',
			'relatedAppealReference',
			'linkableAppeal'
		]) ||
		request.session.appealId !== request.currentAppeal.appealId ||
		!relateAppealsAnswer
	) {
		delete request.session.appealId;
		delete request.session.relatedAppealReference;

		return response.status(500).render('app/500.njk');
	}

	if (relateAppealsAnswer === 'no') {
		delete request.session.appealId;
		delete request.session.relatedAppealReference;
		return response.redirect(`${origin}/other-appeals/add`);
	} else if (relateAppealsAnswer === 'yes') {
		try {
			const relatedAppealDetails = request.session.linkableAppeal.linkableAppealSummary;

			if (!relatedAppealDetails.appealId) {
				delete request.session.appealId;
				delete request.session.relatedAppealReference;

				return response.status(500).render('app/500.njk');
			}

			const { source } = relatedAppealDetails;

			if (source && source === 'back-office') {
				await postAssociateAppeal(
					request.apiClient,
					request.currentAppeal.appealId,
					relatedAppealDetails.appealId
				);
			} else if (source && source === 'horizon') {
				await postAssociateLegacyAppeal(
					request.apiClient,
					request.currentAppeal.appealId,
					request.session.relatedAppealReference
				);
			}

			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: 'relatedAppeal',
				appealId: request.session.appealId,
				text: `Related appeal added`
			});
		} catch (error) {
			let errorMessage = 'Something went wrong when posting related appeal';
			if (error instanceof Error) {
				errorMessage += `: ${error.message}`;
			}

			logger.error(error, errorMessage);
		}
	}

	delete request.session.appealId;
	delete request.session.relatedAppealReference;

	return response.redirect(origin);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {object | undefined} errors
 */
const renderConfirmOtherAppeals = async (request, response, errors = undefined) => {
	if (
		!objectContainsAllKeys(request.session, ['appealId', 'linkableAppeal']) ||
		request.session.appealId !== request.currentAppeal.appealId
	) {
		return response.status(500).render('app/500.njk');
	}

	const { linkableAppeal } = request.session;
	const currentUrl = request.originalUrl;

	const origin = currentUrl.split('/').slice(0, -2).join('/');

	try {
		const relatedAppealDetails = linkableAppeal.linkableAppealSummary;

		const mappedPageContent = confirmOtherAppealsPage(
			request.currentAppeal,
			relatedAppealDetails,
			origin
		);

		return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors: request.errors || errors
		});
	} catch (error) {
		if (error instanceof HTTPError && error.response.statusCode === 404) {
			return response.status(500).render('app/500.njk');
		} else {
			let errorMessage = 'Something went wrong when getting appeal details from reference';
			if (error instanceof Error) {
				errorMessage += `: ${error.message}`;
			}

			logger.error(error, errorMessage);
		}
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getManageOtherAppeals = async (request, response) => {
	const currentUrl = request.originalUrl;

	const origin = currentUrl.split('/').slice(0, -2).join('/');

	const mappedPageContent = manageOtherAppealsPage(request.currentAppeal, request, origin);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getRemoveOtherAppeals = async (request, response) => {
	return renderRemoveOtherAppeals(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderRemoveOtherAppeals = async (request, response) => {
	const { relatedAppealShortReference } = request.params;

	const currentUrl = request.originalUrl;

	const origin = currentUrl.split('/').slice(0, -4).join('/');

	if (!relatedAppealShortReference) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = removeAppealRelationshipPage(
		request.currentAppeal,
		relatedAppealShortReference,
		origin
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors: request.errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postRemoveOtherAppeals = async (request, response) => {
	const { errors } = request;

	if (errors) {
		return renderRemoveOtherAppeals(request, response);
	}

	try {
		const { appealId, relationshipId } = request.params;
		const { removeAppealRelationship } = request.body;
		const currentUrl = getOriginPathname(request);
		const origin = currentUrl.split('/').slice(0, -4).join('/');

		if (!isInternalUrl(origin, request)) {
			return response.status(400).render('errorPageTemplate', {
				message: 'Invalid redirection attempt detected.'
			});
		}

		if (removeAppealRelationship === 'no') {
			return response.redirect(`${origin}/other-appeals/manage`);
		} else if (removeAppealRelationship === 'yes') {
			const appealRelationshipId = parseInt(relationshipId, 10);

			await postUnrelateRequest(request.apiClient, appealId, appealRelationshipId);

			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: 'relatedAppeal',
				appealId,
				text: `Related appeal removed`
			});

			const appealData = request.currentAppeal;

			if (appealData.otherAppeals.length > 0) {
				return response.redirect(`${origin}/other-appeals/manage`);
			} else {
				return response.redirect(origin);
			}
		}
	} catch (error) {
		return response.status(500).render('app/500.njk');
	}
};
