/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} serviceUserId
 * @param {string} userType
 * @param {{firstName: string; lastName: string; emailAddress: string;}} data
 * @returns {Promise<{}>}
 */
export function updateServiceUser(apiClient, appealId, serviceUserId, userType, data) {
	const formattedServiceUser = {
		serviceUserId,
		userType,
		firstName: data.firstName,
		lastName: data.lastName,
		email: data.emailAddress ?? null
	};

	return apiClient.patch(`appeals/${appealId}/service-user`, {
		json: {
			serviceUser: { ...formattedServiceUser }
		}
	});
}
