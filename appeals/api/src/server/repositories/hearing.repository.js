import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.Hearing} Hearing */
/** @typedef {import('@pins/appeals.api').Schema.Address} Address */
/** @typedef {import('@pins/appeals.api').Appeals.CreateHearing} CreateHearing */
/** @typedef {import('@pins/appeals').Address} HearingAddress */
/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {number} id
 * @returns {Promise<Hearing|undefined>}
 */
const getHearingById = async (id) => {
	const hearing = await databaseConnector.hearing.findUnique({
		where: {
			id
		}
	});

	if (hearing) {
		// @ts-ignore
		return hearing;
	}
};

/**
 * @param {{
 *  appealId: number;
 * 	hearingStartTime: Date | string | null;
 * 	hearingEndTime?: Date | string | null;
 *  estimatedDays?: string | number | null;
 *  address?: Omit<Address, 'id'> | null;
 * }} data
 */
const buildCreateHearingData = (data) => {
	const { appealId, hearingStartTime, hearingEndTime, estimatedDays, address } = data;

	return {
		appeal: {
			connect: { id: appealId }
		},
		hearingStartTime,
		hearingEndTime,
		...(estimatedDays && {
			estimatedDays: Number(estimatedDays)
		}),
		...(address && {
			address: {
				create: {
					addressLine1: address.addressLine1 ?? null,
					addressLine2: address.addressLine2 ?? null,
					addressTown: address.addressTown ?? null,
					addressCounty: address.addressCounty ?? null,
					postcode: address.postcode ?? null,
					addressCountry: address.addressCountry ?? null
				}
			}
		})
	};
};

/**
 * @param {{
 *  appealId: number;
 * 	hearingStartTime: Date | string | null;
 * 	hearingEndTime?: Date | string | null;
 *  estimatedDays?: string | number | null;
 *  address?: Omit<Address, 'id'> | null;
 * }} data
 */
const buildUpdateHearingData = (data) => {
	const { hearingStartTime, hearingEndTime, estimatedDays, address } = data;

	let addressStatement = {};

	if (address) {
		addressStatement = {
			address: {
				upsert: {
					create: {
						addressLine1: address.addressLine1 ?? null,
						addressLine2: address.addressLine2 ?? null,
						addressTown: address.addressTown ?? null,
						addressCounty: address.addressCounty ?? null,
						postcode: address.postcode ?? null,
						addressCountry: address.addressCountry ?? null
					},
					update: {
						...(address.addressLine1 !== undefined && { addressLine1: address.addressLine1 }),
						...(address.addressLine2 !== undefined && { addressLine2: address.addressLine2 }),
						...(address.addressTown !== undefined && { addressTown: address.addressTown }),
						...(address.addressCounty !== undefined && { addressCounty: address.addressCounty }),
						...(address.postcode !== undefined && { postcode: address.postcode }),
						...(address.addressCountry !== undefined && { addressCountry: address.addressCountry })
					}
				}
			}
		};
	} else if (address === null) {
		// we cannot delete the address as it could be used for other hearings based on the database schema
		// even if this is not how we use it in practice
		addressStatement = { address: { disconnect: true } };
	}

	console.log('buildUpdateHearingData', {
		hearingStartTime,
		hearingEndTime,
		...(estimatedDays !== undefined && {
			estimatedDays: Number(estimatedDays)
		}),
		...addressStatement
	});

	return {
		hearingStartTime,
		hearingEndTime,
		...(estimatedDays !== undefined && {
			estimatedDays: Number(estimatedDays)
		}),
		...addressStatement
	};
};

/**
 * @param {{
 *  appealId: number;
 * 	hearingStartTime: Date | string | null;
 * 	hearingEndTime?: Date | string | null;
 *  estimatedDays?: string | number | null;
 *  address?: Omit<Address, 'id'>
 * }} data
 * @returns
 */
const createHearingById = (data) => {
	return databaseConnector.hearing.create({
		data: buildCreateHearingData(data)
	});
};

/**
 * @param {number[]} appealIds
 * @param {{
 * 	hearingStartTime: Date | string | null;
 * 	hearingEndTime?: Date | string | null;
 *  estimatedDays?: string | number | null;
 *  address?: Omit<Address, 'id'> | null;
 * }} data
 * @returns {Promise<Hearing[]>}
 */
const createHearingsByAppealIds = async (appealIds, data) => {
	// use a transaction so that if one fails they all fail, and we don't end up with partial data
	// Cannot use a createMany as prisma doesn't support nesting additional relations (here the address)
	// in a createMany call, so we have to create each hearing individually
	return databaseConnector.$transaction(async (tx) => {
		return Promise.all(
			appealIds.map((appealId) =>
				tx.hearing.create({
					data: buildCreateHearingData({
						...data,
						appealId
					})
				})
			)
		);
	});
};

/**
 * @param {number} id
 * @param {{
 *  appealId: number;
 * 	hearingStartTime: Date | string | null;
 * 	hearingEndTime?: Date | string | null;
 *  estimatedDays?: string | number | null;
 *  address?: Omit<Address, 'id'> | null
 *  addressId?: number
 * }} data
 */
const updateHearingById = (id, data) => {
	return databaseConnector.hearing.update({
		where: { id },
		data: buildUpdateHearingData(data),
		include: {
			address: true
		}
	});
};

/**
 * @param {number[]} appealIds
 * @param {{
 * 	hearingStartTime: Date | string | null;
 * 	hearingEndTime?: Date | string | null;
 *  estimatedDays?: string | number | null;
 *  address?: Omit<Address, 'id'> | null | undefined;
 * }} data
 * @returns {Promise<Hearing[]>}
 */
const updateHearingsByAppealIds = async (appealIds, data) => {
	// use a transaction so that if one fails they all fail, and we don't end up with partial data
	// Cannot use a updateMany as prisma doesn't support nesting additional relations (here the address)
	// in a updateMany call, so we have to update each hearing individually
	return databaseConnector.$transaction(async (tx) => {
		return Promise.all(
			appealIds.map((appealId) =>
				tx.hearing.update({
					where: { appealId },
					data: buildUpdateHearingData({
						...data,
						appealId
					}),
					include: {
						address: true
					}
				})
			)
		);
	});
};

/**
 * @param {number} id
 */
const deleteHearingById = (id) => {
	return databaseConnector.hearing.delete({ where: { id } });
};

/**
 * @param {number[]} appealIds
 * */
const deleteMultiHearingsByAppealId = (appealIds) =>
	databaseConnector.hearing.deleteMany({
		where: {
			appealId: { in: appealIds }
		}
	});

/**
 * @param {number[]} appealIds
 * @returns
 */
const getHearingByAppealId = (appealIds) =>
	databaseConnector.hearing.findMany({
		where: {
			appealId: { in: appealIds }
		}
	});

export default {
	getHearingById,
	createHearingById,
	createHearingsByAppealIds,
	updateHearingById,
	updateHearingsByAppealIds,
	deleteHearingById,
	deleteMultiHearingsByAppealId,
	getHearingByAppealId
};
