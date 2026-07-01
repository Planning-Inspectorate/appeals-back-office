import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {{ siteGridReferenceEasting?: number | string, siteGridReferenceNorthing?: number | string }} gridRef
 */
export function changeSiteGridReference(apiClient, appealId, appellantCaseId, gridRef) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			siteGridReferenceEasting: gridRef.siteGridReferenceEasting,
			siteGridReferenceNorthing: gridRef.siteGridReferenceNorthing
		}
	});
}
