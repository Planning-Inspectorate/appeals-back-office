import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import { formatAppealTypeForNotify } from '@pins/appeals/utils/change-appeal-type.js';
import { getTeamFromAppealId } from '../update-case-team/update-case-team.service.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {boolean} filterEnabled
 * @returns {Promise<import('#appeals/appeals.types.js').AppealType[]>}
 */
export function getAppealTypes(apiClient, filterEnabled = false) {
	let url = 'appeals/appeal-types';
	if (filterEnabled) {
		url = url.concat('?filterEnabled=true');
	}

	return apiClient.get(url).json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {number|string} appealId
 * @returns {Promise<import('#appeals/appeals.types.js').AppealType[]>}
 */
export function getAppealTypesFromId(apiClient, appealId) {
	return apiClient.get(`appeals/${appealId}/appeal-types`).json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} appealTypeId
 * @param {string|null} appealTypeFinalDate
 * @returns {Promise<import('./change-appeal-type.types.js').ChangeAppealTypeRequest>}
 */
export async function postAppealChangeRequest(
	apiClient,
	appealId,
	appealTypeId,
	appealTypeFinalDate
) {
	return await apiClient
		.post(`appeals/${appealId}/appeal-change-request`, {
			json: { newAppealTypeId: appealTypeId, newAppealTypeFinalDate: appealTypeFinalDate }
		})
		.json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} appellantCaseId
 * @param {number} appealTypeId
 * @param {string|null} appealTypeFinalDate
 * @returns {Promise<import('./change-appeal-type.types.js').ChangeAppealTypeRequest>}
 */
export async function postAppealResubmitMarkInvalidRequest(
	apiClient,
	appealId,
	appellantCaseId,
	appealTypeId,
	appealTypeFinalDate
) {
	return await apiClient
		.post(`appeals/${appealId}/appeal-resubmit-mark-invalid`, {
			json: {
				newAppealTypeId: appealTypeId,
				newAppealTypeFinalDate: appealTypeFinalDate,
				appellantCaseId
			}
		})
		.json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} appealTypeId
 * @returns {Promise<import('./change-appeal-type.types.js').ChangeAppealTypeRequest>}
 */
export async function postAppealTransferRequest(apiClient, appealId, appealTypeId) {
	return await apiClient
		.post(`appeals/${appealId}/appeal-transfer-request`, {
			json: { newAppealTypeId: appealTypeId }
		})
		.json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} transferredAppealHorizonReference
 * @returns {Promise<import('./change-appeal-type.types.js').ChangeAppealTypeRequest>}
 */
export async function postAppealTransferConfirmation(
	apiClient,
	appealId,
	transferredAppealHorizonReference
) {
	return await apiClient
		.post(`appeals/${appealId}/appeal-transfer-confirmation`, {
			json: { newAppealReference: transferredAppealHorizonReference }
		})
		.json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealTypeId
 * @param {string} appealId
 * @returns {Promise<string>}
 */
export async function getNoResubmitAppealRequestRedirectUrl(apiClient, appealTypeId, appealId) {
	const appealTypes = await getAppealTypes(apiClient, true);

	const appealTypeActive = appealTypes.some(
		(appealType) => appealType.id === parseInt(appealTypeId)
	);

	if (appealTypeActive) {
		return `/appeals-service/appeal-details/${appealId}/change-appeal-type/update-appeal`;
	}
	return `/appeals-service/appeal-details/${appealId}/change-appeal-type/transfer-appeal`;
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealType
 * @param {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} changeAppealType
 */
export async function getChangeAppealTypes(apiClient, appealType, changeAppealType) {
	const appealTypes = await getAppealTypes(apiClient);

	const existingChangeAppealType =
		appealTypes.find((types) => types.type === appealType)?.changeAppealType ?? appealType;

	const newChangeAppealType = appealTypes.find(
		(appealType) => appealType.id === changeAppealType.appealTypeId
	)?.changeAppealType;

	return { existingChangeAppealType, newChangeAppealType };
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {*} appeal
 * @param {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} changeAppealType
 */
export async function getUpdateAppealRequest(apiClient, appeal, changeAppealType) {
	const { existingChangeAppealType, newChangeAppealType } = await getChangeAppealTypes(
		apiClient,
		appeal.appealType,
		changeAppealType
	);

	if (!newChangeAppealType) {
		throw new Error('Unable to parse new change appeal type');
	}

	const { email: assignedTeamEmail } = await getTeamFromAppealId(apiClient, appeal.appealId);

	const personalisation = {
		appeal_reference_number: appeal.appealReference,
		site_address: appealSiteToAddressString(appeal.appealSite),
		lpa_reference: appeal.planningApplicationReference,
		team_email_address: assignedTeamEmail,
		existing_appeal_type: formatAppealTypeForNotify(existingChangeAppealType),
		new_appeal_type: formatAppealTypeForNotify(newChangeAppealType)
	};

	const appellantTemplateName = 'appeal-type-change-in-manage-appeals-appellant.content.md';
	const appellantTemplate = await generateNotifyPreview(
		apiClient,
		appellantTemplateName,
		personalisation
	);

	const lpaTemplateName = 'appeal-type-change-in-manage-appeals-lpa.content.md';
	const lpaTemplate = await generateNotifyPreview(apiClient, lpaTemplateName, personalisation);

	return {
		newChangeAppealType,
		appellantEmailTemplate: appellantTemplate.renderedHtml,
		lpaEmailTemplate: lpaTemplate.renderedHtml
	};
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} appealTypeId
 * @returns {Promise<void>}
 */
export async function postAppealUpdateRequest(apiClient, appealId, appealTypeId) {
	return await apiClient
		.post(`appeals/${appealId}/appeal-update-request`, {
			json: { newAppealTypeId: appealTypeId }
		})
		.json();
}
