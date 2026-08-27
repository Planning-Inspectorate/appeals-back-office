import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/** @typedef {import('../appeal-details.types.js').WebAppeal} Appeal */
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [type]
 */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {User} assigneeUser
 * @param {boolean} isInspector
 * @param {User} prevUser
 * @returns {Promise<Appeal>}
 */
export async function setAppealAssignee(apiClient, appealId, assigneeUser, isInspector, prevUser) {
	const assigneeUserId = assigneeUser.id === '0' ? null : assigneeUser.id;
	const prevUserName = prevUser?.name ?? null;

	let userJson;

	if (isInspector) {
		userJson = {
			...(assigneeUser?.type === 'PADSUser'
				? { padsInspectorId: assigneeUserId, inspectorId: null }
				: { inspectorId: assigneeUserId, padsInspectorId: null }),
			inspectorName: assigneeUser.name,
			prevUserName
		};
	} else {
		userJson = { caseOfficerId: assigneeUserId, caseOfficerName: assigneeUser.name };
	}
	const ids = assertValidNumericIds({ appealId });
	return apiClient.patch(`appeals/${ids.appealId}`, { json: userJson }).json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @returns {Promise<Array<{name: string, sapId: string}>>}
 */
export function getPADSList(apiClient) {
	return apiClient.get('appeals/planning-appeal-decision-suppliers').json();
}
