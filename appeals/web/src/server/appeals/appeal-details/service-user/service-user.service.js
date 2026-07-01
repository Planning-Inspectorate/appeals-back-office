import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/** @typedef {{firstName: string; lastName: string; organisationName: string | null | undefined; email: string | null | undefined; phoneNumber: string | null | undefined;}} WebServiceUser*/
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} userType
 * @param {WebServiceUser} data
 * @returns {Promise<{}>}
 */
export const assignServiceUser = (apiClient, appealId, userType, data) => {
	const ids = assertValidNumericIds({ appealId });
	return apiClient.patch(`appeals/${ids.appealId}?include=childAppeals`, {
		json: {
			[userType]: {
				firstName: data.firstName,
				lastName: data.lastName,
				organisationName: data.organisationName ?? null,
				email: data.email ?? null,
				phoneNumber: data.phoneNumber ?? null
			}
		}
	});
};

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} serviceUserId
 * @param {string} userType
 * @param {WebServiceUser} data
 * @returns {Promise<{}>}
 */
export const updateServiceUser = (apiClient, appealId, serviceUserId, userType, data) => {
	const ids = assertValidNumericIds({ appealId });
	return apiClient.patch(`appeals/${ids.appealId}/service-user`, {
		json: {
			serviceUser: {
				serviceUserId,
				userType,
				firstName: data.firstName,
				lastName: data.lastName,
				organisationName: data.organisationName ?? null,
				email: data.email ?? null,
				phoneNumber: data.phoneNumber ?? null
			}
		}
	});
};

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} serviceUserId
 * @param {string} userType
 * @returns {Promise<{}>}
 */
export const removeServiceUser = (apiClient, appealId, serviceUserId, userType) => {
	const ids = assertValidNumericIds({ appealId });
	return apiClient.delete(`appeals/${ids.appealId}/service-user`, {
		json: {
			serviceUserId,
			userType
		}
	});
};
