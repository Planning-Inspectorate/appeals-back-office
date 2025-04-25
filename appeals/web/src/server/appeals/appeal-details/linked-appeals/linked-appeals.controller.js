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
	generateUnlinkAppealBackLinkUrl,
	alreadyLinkedPage,
	changeLeadAppealPage
} from './linked-appeals.mapper.js';
import { getAppealDetailsFromId } from '../appeal-details.service.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

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
	const { errors, query, session } = request;

	const appealDetails = request.currentAppeal;

	const mappedPageContent = addLinkedAppealPage(
		appealDetails,
		session.linkableAppeal?.linkableAppealSummary,
		query.backUrl ? String(query.backUrl) : undefined
	);

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

	if (request.body.linkConflict) {
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/linked-appeals/add/already-linked`
		);
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

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/linked-appeals/add/check-and-confirm`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAddLinkedAppealCheckAndConfirm = async (request, response) => {
	if (!request.session.linkableAppeal?.linkableAppealSummary) {
		return response.status(500).render('app/500.njk');
	}

	const { session, errors } = request;

	const mappedPageContent = addLinkedAppealCheckAndConfirmPage(
		request.currentAppeal,
		session.linkableAppeal
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
	if (!request.session.linkableAppeal?.linkableAppealSummary) {
		return response.status(500).render('app/500.njk');
	}

	const {
		errors,
		params: { appealId },
		session
	} = request;

	if (errors) {
		return renderAddLinkedAppealCheckAndConfirm(request, response);
	}

	try {
		const { appealId: linkedAppealId, source } =
			session.linkableAppeal?.linkableAppealSummary ?? {};

		const targetIsLead =
			session.linkableAppeal.leadAppeal === session.linkableAppeal.linkableAppealSummary.appealId;

		switch (source) {
			case 'back-office':
				await linkAppealToBackOfficeAppeal(
					request.apiClient,
					appealId,
					session.linkableAppeal?.linkableAppealSummary.appealId,
					targetIsLead
				);
				break;
			case 'horizon':
				await linkAppealToLegacyAppeal(
					request.apiClient,
					appealId,
					session.linkableAppeal?.linkableAppealSummary.appealReference,
					targetIsLead
				);
				break;
			default:
				throw new Error(`unrecognised appeal source '${source}' for appeal ${linkedAppealId}`);
		}

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'appealLinked',
			appealId,
			text: targetIsLead
				? `Appeal ${session.linkableAppeal?.linkableAppealSummary.appealReference} is now the lead for this appeal`
				: `This appeal is now the lead for appeal ${session.linkableAppeal?.linkableAppealSummary.appealReference}`
		});

		delete session.linkableAppeal;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		if (error instanceof HTTPError) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderAddLinkedAppealCheckAndConfirm(request, response);
		}

		throw error;
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export function renderAlreadyLinked(request, response) {
	const { currentAppeal, session, errors } = request;

	const pageContent = alreadyLinkedPage(
		currentAppeal,
		session.linkableAppeal?.linkableAppealSummary
	);

	return response.render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent,
		errors
	});
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export function postAlreadyLinked(request, response) {
	const { params, session } = request;

	delete session.linkableAppeal;

	return response.redirect(`/appeals-service/appeal-details/${params.appealId}/linked-appeals/add`);
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export function renderLeadAppeal(request, response) {
	const { currentAppeal, session, errors } = request;

	if (!session.linkableAppeal) {
		throw new Error('linkableAppeal not present in session');
	}

	const pageContent = changeLeadAppealPage(
		currentAppeal,
		session.linkableAppeal.linkableAppealSummary
	);

	return response.render('patterns/change-page.pattern.njk', {
		pageContent,
		errors
	});
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export function postLeadAppeal(request, response) {
	const { params, body, session, errors } = request;

	if (errors) {
		return renderLeadAppeal(request, response);
	}

	session.linkableAppeal.leadAppeal = body['lead-appeal'];

	return response.redirect(
		`/appeals-service/appeal-details/${params.appealId}/linked-appeals/add/check-and-confirm`
	);
}

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
