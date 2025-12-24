import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.Address} Address */
/** @typedef {import('@pins/appeals.api').Schema.NeighbouringSite} NeighbouringSite */
/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * Adds a neighbouring site with an address to an existing appeal
 * @param {number} appealId
 * @param {{addressLine1: string, addressLine2?: string | null, postcode: string, addressCounty?: string | null, addressTown?: string | undefined}} address
 * @param {string} source
 * @returns {Promise<NeighbouringSite>}
 */
const addSite = async (appealId, source, address) => {
	return databaseConnector.neighbouringSite.create({
		data: {
			appeal: {
				connect: { id: appealId }
			},
			source,
			address: {
				create: {
					...address
				}
			}
		},
		include: {
			address: true
		}
	});
};

/**
 * @param {number} appealId
 * @param {number} addressId
 * @returns {Promise<NeighbouringSite>}
 */
const connectSite = (appealId, addressId) =>
	databaseConnector.neighbouringSite.upsert({
		where: {
			appealId_addressId: {
				appealId,
				addressId
			}
		},
		create: {
			appeal: {
				connect: {
					id: appealId
				}
			},
			address: {
				connect: {
					id: addressId
				}
			},
			source: 'back-office'
		},
		update: {
			appeal: {
				connect: {
					id: appealId
				}
			},
			address: {
				connect: {
					id: addressId
				}
			},
			source: 'back-office'
		},
		include: {
			address: true
		}
	});

/**
 * @param {number} appealId
 * @param {number} addressId
 */
const disconnectSite = (appealId, addressId) =>
	databaseConnector.$transaction(async (tx) => {
		const neighbouringSite = await tx.neighbouringSite.findUnique({
			where: {
				appealId_addressId: {
					appealId,
					addressId
				}
			}
		});

		if (!neighbouringSite) {
			return;
		}

		await tx.neighbouringSite.delete({
			where: {
				appealId_addressId: {
					appealId,
					addressId
				}
			}
		});
	});

/**
 * Updates the address of a neighbouring site
 * @param {number} siteId
 * @param {{addressLine1: string, addressLine2?: string | null, postcode: string, addressCounty?: string | null, addressTown: string}} address
 * @returns {Promise<boolean>}
 */
const updateSite = async (siteId, address) => {
	const transaction = databaseConnector.$transaction(async (tx) => {
		const siteInfo = await tx.neighbouringSite.findUnique({ where: { id: siteId } });
		if (!siteInfo) {
			return false;
		}
		await tx.address.update({
			where: {
				id: siteInfo.addressId
			},
			data: {
				...address
			}
		});

		return true;
	});

	return transaction;
};

/**
 * Deletes a neighbouring site, and its address
 * @param {number} siteId
 * @returns {Promise<boolean>}
 */
const removeSite = async (siteId) => {
	const transaction = databaseConnector.$transaction(async (tx) => {
		const siteInfo = await tx.neighbouringSite.findUnique({ where: { id: siteId } });
		if (!siteInfo) {
			return false;
		}

		await tx.neighbouringSite.delete({
			where: {
				id: siteId
			}
		});
		await tx.address.delete({
			where: {
				id: siteInfo.addressId
			}
		});

		return true;
	});

	return transaction;
};

export default {
	addSite,
	updateSite,
	removeSite,
	connectSite,
	disconnectSite
};
