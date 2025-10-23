/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {{ siteGridReferenceEasting?: number | string, siteGridReferenceNorthing?: number | string }} gridRef
 */
export function changeSiteGridReference(apiClient, appealId, appellantCaseId, gridRef) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			siteGridReferenceEasting: gridRef.siteGridReferenceEasting,
			siteGridReferenceNorthing: gridRef.siteGridReferenceNorthing
		}
	});
}
