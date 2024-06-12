/**
 * @typedef {Object} UpdateOrCreateSiteVisitParameters
 * @property {number} appealIdNumber
 * @property {string} visitDate
 * @property {string} visitStartTime
 * @property {string} visitEndTime
 * @property {import('@pins/appeals/types/inspector.js').SiteVisitType} apiVisitType
 * @property {string} previousVisitType
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
	return apiClient
		.post(`appeals/${appealId}/site-visits`, {
			json: {
				visitDate,
				visitType,
				...(visitStartTime !== '' && { visitStartTime }),
				...(visitEndTime !== '' && { visitEndTime })
			}
		})
		.json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {number} siteVisitId
 * @param {import('@pins/appeals/types/inspector.js').SiteVisitType} visitType
 * @param {string} [previousVisitType]
 * @param {string} [visitDate]
 * @param {string} [visitStartTime]
 * @param {string} [visitEndTime]
 * @param {string} [siteVisitChangeType]
 */
export async function updateSiteVisit(
	apiClient,
	appealId,
	siteVisitId,
	visitType,
	visitDate,
	visitStartTime,
	visitEndTime,
	previousVisitType,
	siteVisitChangeType
) {
	return apiClient
		.patch(`appeals/${appealId}/site-visits/${siteVisitId}`, {
			json: {
				visitType,
				...(visitDate && { visitDate }),
				visitStartTime,
				visitEndTime,
				...(previousVisitType && { previousVisitType }),
				siteVisitChangeType
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
