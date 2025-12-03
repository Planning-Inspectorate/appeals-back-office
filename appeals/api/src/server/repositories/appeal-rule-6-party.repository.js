import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('#db-client/client.ts').AppealRule6Party} AppealRule6Party */
/** @typedef {import('#db-client/client.ts').ServiceUser} ServiceUser */
/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
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

export default { getRule6PartiesForAppeal, createAppealRule6Party };
