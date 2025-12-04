import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('#db-client').AppealRule6Party} AppealRule6Party */
/** @typedef {import('#db-client').ServiceUser} ServiceUser */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {number} appealId
 * @returns {Promise<AppealRule6Party[]|undefined>}
 */
const getRule6PartiesForAppeal = async (appealId) => {
	return databaseConnector.appealRule6Party.findMany({
		where: {
			appealId
		},
		select: {
			id: true,
			appealId: true,
			serviceUserId: true,
			serviceUser: {
				select: {
					id: true,
					organisationName: true,
					salutation: true,
					firstName: true,
					middleName: true,
					lastName: true,
					email: true,
					website: true,
					phoneNumber: true,
					addressId: true
				}
			}
		}
	});
};

/**
 * @param {{
 *  appealId: number;
 * 	serviceUser: ServiceUser;
 * }} data
 * @returns
 */
const createAppealRule6Party = ({ appealId, serviceUser }) => {
	const data = {
		appeal: {
			connect: { id: appealId }
		},
		serviceUser: {
			...(serviceUser.id
				? {
						connect: { id: serviceUser.id }
				  }
				: {
						create: serviceUser
				  })
		}
	};

	return databaseConnector.appealRule6Party.create({ data });
};

/**
 * @param {{rule6PartyId: number, serviceUser: ServiceUser}} data
 * @returns {Promise<AppealRule6Party>}
 */
const updateRule6Party = async ({ rule6PartyId, serviceUser }) => {
	return databaseConnector.appealRule6Party.update({
		where: { id: rule6PartyId },
		select: {
			id: true,
			appealId: true,
			serviceUserId: true,
			serviceUser: {
				select: {
					id: true,
					organisationName: true,
					email: true
				}
			}
		},
		data: {
			serviceUser: {
				update: {
					organisationName: serviceUser.organisationName,
					email: serviceUser.email
				}
			}
		}
	});
};

export default { createAppealRule6Party, getRule6PartiesForAppeal, updateRule6Party };
