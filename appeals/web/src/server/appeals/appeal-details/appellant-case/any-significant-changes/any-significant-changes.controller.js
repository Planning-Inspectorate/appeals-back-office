import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { logger } from '@azure/storage-blob';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { manageSignificantChangesPage } from './any-significant-changes.mapper.js';
import { changeSignificantChanges } from './any-significant-changes.service.js';

/**
 * @typedef {object} SignificantChangesPayload
 * @property {string} anySignificantChanges
 * @property {string | null} anySignificantChanges_localPlanSignificantChanges
 * @property {string | null} anySignificantChanges_nationalPolicySignificantChanges
 * @property {string | null} anySignificantChanges_otherSignificantChanges
 * @property {string | null} anySignificantChanges_courtJudgementSignificantChanges
 */

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeSignificantChanges = async (request, response) => {
	return renderChangeSignificantChanges(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeSignificantChanges = async (request, response) => {
	const { currentAppeal, errors, body } = request;
	try {
		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const pageData = errors ? { ...appellantCaseData, ...body } : appellantCaseData;

		const mappedPageContents = manageSignificantChangesPage(
			currentAppeal,
			pageData,
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`,
			errors
		);
		return response
			.status(errors ? 400 : 200)
			.render('patterns/change-page.pattern.njk', { pageContent: mappedPageContents, errors });
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeSignificantChanges = async (request, response) => {
	const { currentAppeal, errors, body } = request;
	if (errors) {
		return renderChangeSignificantChanges(request, response);
	}
	const { appealId, appellantCaseId } = currentAppeal;
	const {
		anySignificantChangesReasonCheckboxes,
		anySignificantChanges_localPlanSignificantChanges,
		anySignificantChanges_nationalPolicySignificantChanges,
		anySignificantChanges_otherSignificantChanges,
		anySignificantChanges_courtJudgementSignificantChanges
	} = body;

	// Ensure anySignificantChangesReasonCheckboxes is an array
	/** @type {string[]} */
	const reasonsSelected = Array.isArray(anySignificantChangesReasonCheckboxes)
		? anySignificantChangesReasonCheckboxes
		: [anySignificantChangesReasonCheckboxes].filter(Boolean);

	/** @type {SignificantChangesPayload} */
	const payload = {
		anySignificantChanges:
			reasonsSelected.includes('none') || reasonsSelected.length === 0 ? 'No' : 'Yes',
		anySignificantChanges_localPlanSignificantChanges: null,
		anySignificantChanges_nationalPolicySignificantChanges: null,
		anySignificantChanges_otherSignificantChanges: null,
		anySignificantChanges_courtJudgementSignificantChanges: null
	};

	if (reasonsSelected.includes('none')) {
		// If "no significant changes" is selected, clear other fields
		payload.anySignificantChanges_localPlanSignificantChanges = null;
		payload.anySignificantChanges_nationalPolicySignificantChanges = null;
		payload.anySignificantChanges_otherSignificantChanges = null;
		payload.anySignificantChanges_courtJudgementSignificantChanges = null;
	} else {
		// Otherwise, include values for selected checkboxes
		payload.anySignificantChanges_localPlanSignificantChanges = reasonsSelected.includes(
			'anySignificantChanges_localPlanSignificantChanges'
		)
			? anySignificantChanges_localPlanSignificantChanges
			: null;
		payload.anySignificantChanges_nationalPolicySignificantChanges = reasonsSelected.includes(
			'anySignificantChanges_nationalPolicySignificantChanges'
		)
			? anySignificantChanges_nationalPolicySignificantChanges
			: null;
		payload.anySignificantChanges_otherSignificantChanges = reasonsSelected.includes(
			'anySignificantChanges_otherSignificantChanges'
		)
			? anySignificantChanges_otherSignificantChanges
			: null;
		payload.anySignificantChanges_courtJudgementSignificantChanges = reasonsSelected.includes(
			'anySignificantChanges_courtJudgementSignificantChanges'
		)
			? anySignificantChanges_courtJudgementSignificantChanges
			: null;
	}
	try {
		await changeSignificantChanges(request.apiClient, appealId, appellantCaseId, payload);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Significant changes updated'
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		console.log(error);
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
