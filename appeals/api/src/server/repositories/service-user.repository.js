import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.Address} Address */
/** @typedef {import('@pins/appeals.api').Schema.ServiceUser} ServiceUser */
/** @typedef {import('#db-client/models.ts').ServiceUserUncheckedCreateInput} ServiceUserCreateInput */

/**
 * @param {number} id
 * @returns {Promise<ServiceUser | null>}
 * */
const getServiceUserById = (id) => databaseConnector.serviceUser.findUnique({ where: { id } });

/**
 * Updates a service user's details
 * @param { number } id
 * @param {import('#db-client/models.ts').ServiceUserUncheckedUpdateInput} data
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

export default {
	createServiceUser,
	getServiceUserById,
	updateServiceUserById
};
