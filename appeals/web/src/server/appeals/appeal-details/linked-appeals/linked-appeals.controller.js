import logger from '#lib/logger.js';
import { HTTPError } from 'got';
import {
	postUnlinkRequest,
	linkAppealToBackOfficeAppeal,
	linkAppealToLegacyAppeal
} from './linked-appeals.service.js';
import {
	manageLinkedAppealsPage,
	addLinkedAppealPage,
	addLinkedAppealCheckAndConfirmPage,
	unlinkAppealPage,
	generateUnlinkAppealBackLinkUrl
} from './linked-appeals.mapper.js';
import { getAppealDetailsFromId } from '../appeal-details.service.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderManageLinkedAppeals = async (request, response) => {
	const {
		errors,
		params: { appealId }
	} = request;

	const appealData = request.currentAppeal;

	const leadLinkedAppeal = appealData.isChildAppeal
		? appealData.linkedAppeals.find(
				(
					/** @type {import('@pins/appeals.api/src/server/endpoints/appeals.js').LinkedAppeal} */ linkedAppeal
				) => linkedAppeal.isParentAppeal
		  )
		: undefined;

	const leadAppealData = leadLinkedAppeal?.appealId
		? await getAppealDetailsFromId(request.apiClient, leadLinkedAppeal.appealId)
		: undefined;

	if (appealData.isChildAppeal && !(leadLinkedAppeal && leadAppealData)) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = manageLinkedAppealsPage(
		appealData,
		appealId,
		leadLinkedAppeal,
		leadAppealData
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAddLinkedAppealReference = (request, response) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	const mappedPageContent = addLinkedAppealPage(appealDetails);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddLinkedAppeal = (request, response) => {
	if (request.errors) {
		return renderAddLinkedAppealReference(request, response);
	}

	const {
		params: { appealId }
	} = request;

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

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/linked-appeals/add/check-and-confirm`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAddLinkedAppealCheckAndConfirm = async (request, response) => {
	if (!objectContainsAllKeys(request.session, 'linkableAppeal')) {
		return response.status(500).render('app/500.njk');
	}

	const { errors } = request;

	const targetAppealDetails = request.currentAppeal;
	let linkCandidateAppealData;

	if (request.session.linkableAppeal?.linkableAppealSummary.source === 'back-office') {
		linkCandidateAppealData = await getAppealDetailsFromId(
			request.apiClient,
			request.session.linkableAppeal?.linkableAppealSummary.appealId
		);
	}

	const mappedPageContent = addLinkedAppealCheckAndConfirmPage(
		targetAppealDetails,
		request.session.linkableAppeal?.linkableAppealSummary,
		linkCandidateAppealData
	);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddLinkedAppealCheckAndConfirm = async (request, response) => {
	if (!objectContainsAllKeys(request.session, 'linkableAppeal')) {
		return response.status(500).render('app/500.njk');
	}

	const {
		errors,
		params: { appealId },
		body: { confirmation }
	} = request;

	if (errors) {
		return renderAddLinkedAppealCheckAndConfirm(request, response);
	}

	try {
		const targetIsLead = confirmation === 'child';

		if (confirmation === 'cancel') {
			return response.redirect(`/appeals-service/appeal-details/${appealId}/linked-appeals/add`);
		} else if (request.session.linkableAppeal?.linkableAppealSummary.source === 'back-office') {
			await linkAppealToBackOfficeAppeal(
				request.apiClient,
				appealId,
				request.session.linkableAppeal?.linkableAppealSummary.appealId,
				targetIsLead
			);
		} else {
			await linkAppealToLegacyAppeal(
				request.apiClient,
				appealId,
				request.session.linkableAppeal?.linkableAppealSummary.appealReference,
				targetIsLead
			);
		}

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'appealLinked',
			appealId,
			text: `This appeal is now ${targetIsLead ? 'the lead for' : 'a child of'} appeal ${
				request.session.linkableAppeal?.linkableAppealSummary.appealReference
			}`
		});

		delete request.session.linkableAppeal;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderAddLinkedAppealCheckAndConfirm(request, response);
		}

		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postUnlinkAppeal = async (request, response) => {
	const { appealId, relationshipId, backLinkAppealId } = request.params;
	const { unlinkAppeal } = request.body;
	const { errors } = request;

	if (errors) {
		return renderUnlinkAppeal(request, response);
	}

	switch (unlinkAppeal) {
		case 'no': {
			const backLinkUrl = generateUnlinkAppealBackLinkUrl(
				appealId,
				relationshipId,
				backLinkAppealId
			);

			return response.redirect(backLinkUrl);
		}
		case 'yes': {
			const appealRelationshipId = parseInt(relationshipId, 10);
			const appealData = request.currentAppeal;
			const childRef =
				appealData.linkedAppeals.find(
					(
						/** @type {import('@pins/appeals.api/src/server/endpoints/appeals.js').LinkedAppeal} */ linkedAppeal
					) => linkedAppeal.relationshipId === appealRelationshipId
				)?.appealReference || '';

			await postUnlinkRequest(request.apiClient, appealId, appealRelationshipId);

			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: 'appealUnlinked',
				appealId: backLinkAppealId,
				text: `You have unlinked this appeal from appeal ${
					appealId === backLinkAppealId ? childRef : appealData.appealReference
				}`
			});

			return response.redirect(`/appeals-service/appeal-details/${backLinkAppealId}`);
		}
		default:
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/change-appeal-type/change-appeal-final-date`
			);
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderUnlinkAppeal = (request, response) => {
	const {
		errors,
		params: { appealId, relationshipId, backLinkAppealId }
	} = request;

	const appealData = request.currentAppeal;

	const childRef =
		appealData.linkedAppeals.find(
			(
				/** @type {import('@pins/appeals.api/src/server/endpoints/appeals.js').LinkedAppeal} */ linkedAppeal
			) => linkedAppeal.relationshipId === parseInt(relationshipId, 10)
		)?.appealReference || '';

	const mappedPageContent = unlinkAppealPage(
		appealData,
		childRef,
		appealId,
		relationshipId,
		backLinkAppealId
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};
