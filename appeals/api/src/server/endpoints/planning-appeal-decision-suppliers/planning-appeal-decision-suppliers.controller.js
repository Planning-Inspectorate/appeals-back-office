import { getLookupDataByValue } from '#common/controllers/lookup-data.controller.js';
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getPADSUserFromSapId = async (request, response) => {
	const { sapId } = request.params;
	const result = await getLookupDataByValue('pADSUser', { key: 'sapId', value: sapId });
	return response.send(result);
};
