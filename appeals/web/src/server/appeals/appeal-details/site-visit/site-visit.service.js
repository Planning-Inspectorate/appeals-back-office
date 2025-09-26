/**
 * @typedef {Object} UpdateOrCreateSiteVisitParameters
 * @property {number} appealIdNumber
 * @property {string} visitDate
 * @property {string|undefined} visitStartTime
 * @property {string|undefined} visitEndTime
 * @property {string} inspectorName
 * @property {import('@pins/appeals/types/inspector.js').SiteVisitType} apiVisitType
 * @property {string} previousVisitType
 */

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {import('@pins/appeals/types/inspector.js').SiteVisitType} visitType
 * @param {string} visitDate
 * @param {string|undefined} visitStartTime
 * @param {string|undefined} visitEndTime
 * @param {string} inspectorName
 */
export async function createSiteVisit(
	apiClient,
	appealId,
	visitType,
	visitDate,
	visitStartTime,
	visitEndTime,
	inspectorName
) {
	return apiClient
		.post(`appeals/${appealId}/site-visits`, {
			json: {
				visitDate,
				visitType,
				inspectorName,
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
 * @param {string} [visitDate]
 * @param {string} [visitStartTime]
 * @param {string} [visitEndTime]
 * @param {string} [previousVisitType]
 * @param {string} [inspectorName]
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
	inspectorName,
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
				inspectorName,
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
/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {number} siteVisitId
 * @returns {Promise<import('@pins/appeals.api/src/server/endpoints/appeals.js').SingleSiteVisitDetailsResponse>}
 */
export async function cancelSiteVisit(apiClient, appealId, siteVisitId) {
	return apiClient.delete(`appeals/${appealId}/site-visits/${siteVisitId}`).json();
}
