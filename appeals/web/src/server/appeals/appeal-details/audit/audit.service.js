import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/** @typedef {import('@pins/appeals.api/src/server/endpoints/appeals').GetAuditTrailsResponse} GetAuditTrailsResponse */
/** @typedef {import('@pins/appeals.api/src/server/openapi-types.js').AuditNotifications} AuditNotifications */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<GetAuditTrailsResponse>}
 */
export const getAppealAudit = (apiClient, appealId) => {
	const ids = assertValidNumericIds({ appealId });
	return apiClient.get(`appeals/${ids.appealId}/audit-trails`).json();
};

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<AuditNotifications>}
 */
export const getAppealAuditNotifications = (apiClient, appealId) => {
	const ids = assertValidNumericIds({ appealId });
	return apiClient.get(`appeals/${ids.appealId}/audit-notifications`).json();
};
