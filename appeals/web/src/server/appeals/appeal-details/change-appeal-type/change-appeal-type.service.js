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
 * @param {string} horizonReference
 * @returns {Promise<{caseFound: boolean}>}
 */
export async function checkAppealReferenceExistsInHorizon(apiClient, horizonReference) {
	return await apiClient.get(`appeals/transferred-appeal/${horizonReference}`).json();
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
