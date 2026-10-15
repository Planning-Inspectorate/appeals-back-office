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
 *  address?: Omit<Address, 'id'>
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
 *  address?: Omit<Address, 'id'>
 * }} data
 * @returns {Promise<Hearing[]>}
 */
const createHearingsByAppealIds = async (appealIds, data) => {
	// use a transaction so that if one fails they all fail, and we don't end up with partial data
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
	const { appealId, hearingStartTime, hearingEndTime, estimatedDays, address, addressId } = data;

	let addressStatement = {};

	if (addressId) {
		addressStatement = { address: { connect: { id: addressId } } };
	} else if (address) {
		addressStatement = {
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
		};
	} else if (address === null) {
		addressStatement = { address: { disconnect: true } };
	}

	const hearingData = {
		...(appealId && {
			appeal: {
				connect: { id: appealId }
			}
		}),
		hearingStartTime,
		hearingEndTime,
		...(estimatedDays !== undefined && {
			estimatedDays: Number(estimatedDays)
		}),
		...addressStatement
	};

	return databaseConnector.hearing.update({
		where: { id },
		data: hearingData,
		include: {
			address: true
		}
	});
};

/**
 * @param {number} id
 */
const deleteHearingById = (id) => {
	return databaseConnector.hearing.delete({ where: { id } });
};

export default {
	getHearingById,
	createHearingById,
	createHearingsByAppealIds,
	updateHearingById,
	deleteHearingById
};
