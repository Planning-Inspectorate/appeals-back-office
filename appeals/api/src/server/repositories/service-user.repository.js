import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Appeals.UpdateAddressRequest} UpdateAddressRequest */
/** @typedef {import('@pins/appeals.api').Schema.ServiceUser} ServiceUser */
/** @typedef {import('#db-client').Prisma.ServiceUserCreateInput} ServiceUserCreateInput */

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
 * @param {ServiceUserCreateInput} data
 * @returns {Promise<ServiceUser>}
 * */
const createServiceUser = (data) => databaseConnector.serviceUser.create({ data });

export default { createServiceUser, updateServiceUserById };
