/**
 * @param {import('got').Got} apiClient
 * @returns {Promise<{ id: number, name: string }[]>}
 * */
export const getAllocationSpecialisms = async (apiClient) =>
	apiClient.get('appeals/appeal-allocation-specialisms').json();
