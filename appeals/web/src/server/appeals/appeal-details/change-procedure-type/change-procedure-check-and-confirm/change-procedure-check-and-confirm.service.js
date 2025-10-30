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
	return await apiClient.post(`appeals/${appealId}/procedure-type-change-request`, {
		json: data
	});
};
