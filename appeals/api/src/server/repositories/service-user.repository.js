import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Appeals.UpdateAddressRequest} UpdateAddressRequest */
/** @typedef {import('@pins/appeals.api').Schema.ServiceUser} ServiceUser */
/**
 * @typedef {Object} ServiceUserInput
 * @property {string} [organisationName]
 * @property {string} [salutation]
 * @property {string} [firstName]
 * @property {string} [middleName]
 * @property {string} [lastName]
 * @property {string} [email]
 * @property {string} [website]
 * @property {string} [phoneNumber]
 * @property {UpdateAddressRequest} address
 * */

/**
 * Updates a service user's details
 * @param { number } id
 * @param {import('#db-client').Prisma.ServiceUserUncheckedUpdateInput} data
 * @returns {Promise<ServiceUser | null>}
 */
const updateServiceUserById = (id, data) => {
	const transaction = databaseConnector.$transaction(async (tx) => {
		const serviceUserInfo = await tx.serviceUser.findUnique({ where: { id: id } });
		if (!serviceUserInfo) {
			return serviceUserInfo;
		}

		return await tx.serviceUser.update({
			where: { id },
			data
		});
	});

	return transaction;
};

/**
 * @param {ServiceUserInput} data
 * @returns {Promise<ServiceUser>}
 * */
const createServiceUser = async (data) => {
	const {
		organisationName,
		salutation,
		firstName,
		middleName,
		lastName,
		email,
		website,
		phoneNumber,
		address
	} = data;

	return databaseConnector.serviceUser.create({
		data: {
			organisationName,
			salutation,
			firstName,
			middleName,
			lastName,
			email,
			website,
			phoneNumber,
			address: {
				create: address
			}
		}
	});
};

export default { createServiceUser, updateServiceUserById };
