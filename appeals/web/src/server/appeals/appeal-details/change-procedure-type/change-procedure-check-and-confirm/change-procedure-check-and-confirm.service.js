import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @typedef {import('../change-procedure-type.controller.js').ChangeProcedureTypeRequest} ChangeProcedureTypeRequest
 */

/**
 * @param {any} apiClient
 * @param {string} appealId
 * @param {ChangeProcedureTypeRequest} data
 * @returns {Promise<*>}
 */
export const postProcedureChangeRequest = async (apiClient, appealId, data) => {
	const ids = assertValidNumericIds({ appealId });
	return await apiClient.post(`appeals/${ids.appealId}/procedure-type-change-request`, {
		json: data
	});
};
