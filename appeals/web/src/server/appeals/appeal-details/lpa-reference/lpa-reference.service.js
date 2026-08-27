import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} updatedLpaReference
 * @returns {Promise<{}>}
 */
export function changeLpaReference(apiClient, appealId, updatedLpaReference) {
	const ids = assertValidNumericIds({ appealId });
	return apiClient.patch(`appeals/${ids.appealId}`, {
		json: {
			planningApplicationReference: updatedLpaReference
		}
	});
}
