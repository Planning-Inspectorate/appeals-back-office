import logger from '#lib/logger.js';
import {
	postUnlinkRequest,
	linkAppealToBackOfficeAppeal,
	linkAppealToLegacyAppeal
} from './manage-linked-appeals.service.js';
import {
	manageLinkedAppealsPage,
	addLinkedAppealPage,
	addLinkedAppealCheckAndConfirmPage,
	unlinkAppealPage,
	generateUnlinkAppealBackLinkUrl
} from './manage-linked-appeals.mapper.js';
import { getAppealDetailsFromId } from '../appeal-details.service.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getManageLinkedAppeals = async (request, response) => {
	return renderManageLinkedAppeals(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderManageLinkedAppeals = async (request, response) => {
	const {
		errors,
		params: { appealId }
	} = request;

	const appealData = request.currentAppeal;
	let leadAppealData;
	let leadLinkedAppeal;

	if (appealData.isChildAppeal === true) {
		leadLinkedAppeal = appealData.linkedAppeals.find(
			(
				/** @type {import('@pins/appeals.api/src/server/endpoints/appeals.js').LinkedAppeal} */ linkedAppeal
			) => linkedAppeal.isParentAppeal
		);

		if (leadLinkedAppeal && leadLinkedAppeal.appealId) {
			leadAppealData = await getAppealDetailsFromId(
				request.apiClient,
				`${leadLinkedAppeal.appealId}`
			);
		}

		if (!leadLinkedAppeal || !leadAppealData) {
			return response.status(500).render('app/500.njk');
		}
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
export const getAddLinkedAppealReference = async (request, response) => {
	return renderAddLinkedAppealReference(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAddLinkedAppealReference = async (request, response) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	const mappedPageContent = await addLinkedAppealPage(appealDetails);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddLinkedAppeal = async (request, response) => {
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
export const getAddLinkedAppealCheckAndConfirm = async (request, response) => {
	return renderAddLinkedAppealCheckAndConfirm(request, response);
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

		addNotificationBannerToSession(
			request.session,
			'appealLinked',
			appealId,
			`<p class="govuk-notification-banner__heading">This appeal is now ${
				targetIsLead ? 'the lead for' : 'a child of'
			} appeal ${request.session.linkableAppeal?.linkableAppealSummary.appealReference}</p>`
		);

		delete request.session.linkableAppeal;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getUnlinkAppeal = async (request, response) => {
	return renderUnlinkAppeal(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postUnlinkAppeal = async (request, response) => {
	try {
		const { appealId, relationshipId, backLinkAppealId } = request.params;
		const { unlinkAppeal } = request.body;
		const { errors } = request;

		if (errors) {
			return renderUnlinkAppeal(request, response);
		}

		if (unlinkAppeal === 'no') {
			const backLinkUrl = generateUnlinkAppealBackLinkUrl(
				appealId,
				relationshipId,
				backLinkAppealId
			);
			return response.redirect(backLinkUrl);
		}
		if (unlinkAppeal === 'yes') {
			const appealRelationshipId = parseInt(relationshipId, 10);
			const appealData = request.currentAppeal;
			const childRef =
				appealData.linkedAppeals.find(
					(
						/** @type {import('@pins/appeals.api/src/server/endpoints/appeals.js').LinkedAppeal} */ linkedAppeal
					) => linkedAppeal.relationshipId === appealRelationshipId
				)?.appealReference || '';

			await postUnlinkRequest(request.apiClient, appealId, appealRelationshipId);

			addNotificationBannerToSession(
				request.session,
				'appealUnlinked',
				backLinkAppealId,
				`<p class="govuk-notification-banner__heading">You have unlinked this appeal from appeal ${
					appealId === backLinkAppealId ? childRef : appealData.appealReference
				}</p>`
			);

			return response.redirect(`/appeals-service/appeal-details/${backLinkAppealId}`);
		}

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-type/change-appeal-final-date`
		);
	} catch (error) {
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderUnlinkAppeal = async (request, response) => {
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

	const mappedPageContent = await unlinkAppealPage(
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
