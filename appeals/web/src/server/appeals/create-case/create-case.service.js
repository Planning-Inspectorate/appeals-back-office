/**
 * // TODO: update once case type letters and schema are provided by ODW
 * @param {import('got').Got} apiClient
 * @param {{ caseType: string, submissionDate: string }} data
 * @returns {Promise<{ appealId: number, reference: string }>}
 */
export function createCase(apiClient, data) {
	return apiClient.post('appeals', { json: data }).json();
}
