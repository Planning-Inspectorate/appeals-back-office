/** @typedef {import('../appeal-details.types.js').WebAppeal} Appeal */
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
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
	return apiClient
		.patch(`appeals/${appealId}`, {
			json: isInspector
				? {
						inspectorId: assigneeUserId,
						inspectorName: assigneeUser.name,
						prevUserName: prevUser?.name || null
				  }
				: { caseOfficerId: assigneeUserId, caseOfficerName: assigneeUser.name }
		})
		.json();
}
