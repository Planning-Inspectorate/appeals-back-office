/** @typedef {import('@pins/appeals.api/src/server/endpoints/appeals').GetAuditTrailsResponse} GetAuditTrailsResponse */
/** @typedef {import('@pins/appeals.api/src/server/openapi-types.js').AuditNotifications} AuditNotifications */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<GetAuditTrailsResponse>}
 */
export const getAppealAudit = (apiClient, appealId) =>
	apiClient.get(`appeals/${appealId}/audit-trails`).json();

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<AuditNotifications>}
 */
export const getAppealAuditNotifications = (apiClient, appealId) =>
	apiClient.get(`appeals/${appealId}/audit-notifications`).json();
