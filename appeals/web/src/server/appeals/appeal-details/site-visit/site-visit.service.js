/**
 * @typedef {Object} UpdateOrCreateSiteVisitParameters
 * @property {number} appealIdNumber
 * @property {string} visitDate
 * @property {string} visitStartTime
 * @property {string} visitEndTime
 * @property {import('@pins/appeals/types/inspector.js').SiteVisitType} apiVisitType
 */

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {import('@pins/appeals/types/inspector.js').SiteVisitType} visitType
 * @param {string} visitDate
 * @param {string} visitStartTime
 * @param {string} visitEndTime
 */
export async function createSiteVisit(
	apiClient,
	appealId,
	visitType,
	visitDate,
	visitStartTime,
	visitEndTime
) {
	if (visitStartTime !== '' && visitEndTime !== '') {
		return apiClient
			.post(`appeals/${appealId}/site-visits`, {
				json: {
					visitDate,
					visitStartTime,
					visitEndTime,
					visitType
				}
			})
			.json();
	}
	return apiClient
		.post(`appeals/${appealId}/site-visits`, {
			json: {
				visitDate,
				visitType
			}
		})
		.json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {number} siteVisitId
 * @param {import('@pins/appeals/types/inspector.js').SiteVisitType} visitType
 * @param {string} [visitDate]
 * @param {string} [visitStartTime]
 * @param {string} [visitEndTime]
 */
export async function updateSiteVisit(
	apiClient,
	appealId,
	siteVisitId,
	visitType,
	visitDate,
	visitStartTime,
	visitEndTime
) {
	return apiClient
		.patch(`appeals/${appealId}/site-visits/${siteVisitId}`, {
			json: {
				visitType,
				...(visitDate && { visitDate }),
				visitStartTime,
				visitEndTime
			}
		})
		.json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {number} siteVisitId
 * @returns {Promise<import('@pins/appeals.api/src/server/endpoints/appeals.js').SingleSiteVisitDetailsResponse>}
 */
export async function getSiteVisit(apiClient, appealId, siteVisitId) {
	return apiClient.get(`appeals/${appealId}/site-visits/${siteVisitId}`).json();
}
