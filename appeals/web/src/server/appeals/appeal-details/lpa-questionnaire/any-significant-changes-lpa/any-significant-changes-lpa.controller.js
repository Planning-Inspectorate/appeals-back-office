import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { logger } from '@azure/storage-blob';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { manageSignificantChangesLpaPage } from './any-significant-changes-lpa.mapper.js';
import { changeSignificantChangesLpa } from './any-significant-changes-lpa.service.js';

/**
 * @typedef {object} SignificantChangesPayload
 * @property {string} anySignificantChangesLpa
 * @property {string | null} anySignificantChangesLpa_localPlanSignificantChanges
 * @property {string | null} anySignificantChangesLpa_nationalPolicySignificantChanges
 * @property {string | null} anySignificantChangesLpa_otherSignificantChanges
 * @property {string | null} anySignificantChangesLpa_courtJudgementSignificantChanges
 */

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeSignificantChangesLpa = async (request, response) => {
	return renderChangeSignificantChangesLpa(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeSignificantChangesLpa = async (request, response) => {
	const { apiClient, currentAppeal, errors, body } = request;
	try {
		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const pageData = errors ? { ...lpaQuestionnaireData, ...body } : lpaQuestionnaireData;

		const mappedPageContents = manageSignificantChangesLpaPage(
			currentAppeal,
			pageData,
			`/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${currentAppeal.lpaQuestionnaireId}`,
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
export const postChangeSignificantChangesLpa = async (request, response) => {
	const { currentAppeal, errors, body } = request;
	if (errors) {
		return renderChangeSignificantChangesLpa(request, response);
	}
	const { appealId, lpaQuestionnaireId } = currentAppeal;
	const {
		anySignificantChangesReasonLpaCheckboxes,
		anySignificantChangesLpa_localPlanSignificantChanges,
		anySignificantChangesLpa_nationalPolicySignificantChanges,
		anySignificantChangesLpa_otherSignificantChanges,
		anySignificantChangesLpa_courtJudgementSignificantChanges
	} = body;

	// Ensure anySignificantChangesReasonCheckboxes is an array
	/** @type {string[]} */
	const reasonsSelected = Array.isArray(anySignificantChangesReasonLpaCheckboxes)
		? anySignificantChangesReasonLpaCheckboxes
		: [anySignificantChangesReasonLpaCheckboxes].filter(Boolean);

	/** @type {SignificantChangesPayload} */
	const payload = {
		anySignificantChangesLpa:
			reasonsSelected.includes('none') || reasonsSelected.length === 0 ? 'No' : 'Yes',
		anySignificantChangesLpa_localPlanSignificantChanges: null,
		anySignificantChangesLpa_nationalPolicySignificantChanges: null,
		anySignificantChangesLpa_otherSignificantChanges: null,
		anySignificantChangesLpa_courtJudgementSignificantChanges: null
	};

	if (reasonsSelected.includes('none')) {
		// If "no significant changes" is selected, clear other fields
		payload.anySignificantChangesLpa_localPlanSignificantChanges = null;
		payload.anySignificantChangesLpa_nationalPolicySignificantChanges = null;
		payload.anySignificantChangesLpa_otherSignificantChanges = null;
		payload.anySignificantChangesLpa_courtJudgementSignificantChanges = null;
	} else {
		// Otherwise, include values for selected checkboxes
		payload.anySignificantChangesLpa_localPlanSignificantChanges = reasonsSelected.includes(
			'anySignificantChangesLpa_localPlanSignificantChanges'
		)
			? anySignificantChangesLpa_localPlanSignificantChanges
			: null;
		payload.anySignificantChangesLpa_nationalPolicySignificantChanges = reasonsSelected.includes(
			'anySignificantChangesLpa_nationalPolicySignificantChanges'
		)
			? anySignificantChangesLpa_nationalPolicySignificantChanges
			: null;
		payload.anySignificantChangesLpa_otherSignificantChanges = reasonsSelected.includes(
			'anySignificantChangesLpa_otherSignificantChanges'
		)
			? anySignificantChangesLpa_otherSignificantChanges
			: null;
		payload.anySignificantChangesLpa_courtJudgementSignificantChanges = reasonsSelected.includes(
			'anySignificantChangesLpa_courtJudgementSignificantChanges'
		)
			? anySignificantChangesLpa_courtJudgementSignificantChanges
			: null;
	}
	try {
		await changeSignificantChangesLpa(request.apiClient, appealId, lpaQuestionnaireId, payload);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Significant changes updated'
		});

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
