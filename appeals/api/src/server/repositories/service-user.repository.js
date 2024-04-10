import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.ServiceUser} ServiceUser */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * Updates a service user's details
 * @param { number } id
 * @param {{organisationName: string | null, firstName: string, middleName: string | null, lastName: string, email: string | null, phoneNumber: string | null, addressId: number | null }} data
 * @returns {PrismaPromise<ServiceUser>}
 */
const updateServiceUserById = (id, data) =>
	databaseConnector.serviceUser.update({
		where: { id },
		data
	});

export default { updateServiceUserById };
