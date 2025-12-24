import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Appeals.UpdateAddressRequest} UpdateAddressRequest */
/** @typedef {import('@pins/appeals.api').Schema.Address} Address */
/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {number} id
 * @param {UpdateAddressRequest} data
 * @returns {PrismaPromise<Address>}
 */
const updateAddressById = (id, data) =>
	databaseConnector.address.update({
		where: { id },
		data
	});

/**
 * @param {UpdateAddressRequest} data
 * @returns {PrismaPromise<Address>}
 * */
const createAddress = (data) => databaseConnector.address.create({ data });

/**
 * @param {object} params
 * @param {number} params.appellantCaseId
 * @param {number} params.appealId
 * @param {UpdateAddressRequest} params.data
 * @returns {Promise<Address>}
 * */
const createAppellantCaseContactAddress = ({ appellantCaseId, appealId, data }) =>
	databaseConnector.$transaction(async (tx) => {
		const address = await tx.address.create({ data });
		await tx.appellantCase.update({
			data: {
				contactAddressId: address.id
			},
			where: {
				id: appellantCaseId,
				appealId
			}
		});
		return address;
	});

/**
 * @param {object} params
 * @param {number} params.id
 * @param {number} params.appellantCaseId
 * @param {number} params.appealId
 * @param {UpdateAddressRequest} params.data
 * @returns {PrismaPromise<Address>}
 */
const updateAppellantCaseContactAddressById = ({ id, appellantCaseId, appealId, data }) =>
	databaseConnector.address.update({
		where: {
			id,
			AppellantCase: {
				every: { id: appellantCaseId, appealId }
			}
		},
		data
	});

export default {
	createAddress,
	updateAddressById,
	createAppellantCaseContactAddress,
	updateAppellantCaseContactAddressById
};
