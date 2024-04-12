/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} serviceUserId
 * @param {string} userType
 * @param {{firstName: string; lastName: string; emailAddress: string;}} data
 * @returns {Promise<{}>}
 */
export const updateServiceUser = (apiClient, appealId, serviceUserId, userType, data) =>
	apiClient.patch(`appeals/${appealId}/service-user`, {
		json: {
			serviceUser: {
				serviceUserId,
				userType,
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.emailAddress ?? null
			}
		}
	});
