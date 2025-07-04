import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.Inquiry} Inquiry */
/** @typedef {import('@pins/appeals.api').Schema.Address} Address */
/** @typedef {import('@pins/appeals.api').Appeals.CreateInquiry} CreateInquiry */
/** @typedef {import('@pins/appeals.api').Appeals.InquiryAddress} InquiryAddress */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {number} id
 * @returns {Promise<Inquiry|undefined>}
 */
const getInquiryById = async (id) => {
	const inquiry = await databaseConnector.inquiry.findUnique({
		where: {
			id
		}
	});

	if (inquiry) {
		// @ts-ignore
		return inquiry;
	}
};

/**
 * @param {{
 *  appealId: number;
 * 	inquiryStartTime: Date | string;
 * 	inquiryEndTime?: Date | string;
 *  address?: Omit<Address, 'id'>
 * }} data
 * @returns
 */
const createInquiryById = (data) => {
	const { appealId, inquiryStartTime, inquiryEndTime, address } = data;

	const inquiryData = {
		appeal: {
			connect: { id: appealId }
		},
		inquiryStartTime,
		inquiryEndTime,
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

	return databaseConnector.inquiry.create({
		data: inquiryData
	});
};

/**
 * @param {number} id
 * @param {{
 *  appealId: number;
 * 	inquiryStartTime: Date | string;
 * 	inquiryEndTime?: Date | string;
 *  address?: Omit<Address, 'id'> | null
 *  addressId?: number
 * }} data
 */
const updateInquiryById = (id, data) => {
	const { appealId, inquiryStartTime, inquiryEndTime, address, addressId } = data;

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

	const inquiryData = {
		...(appealId && {
			appeal: {
				connect: { id: appealId }
			}
		}),
		inquiryStartTime,
		inquiryEndTime,
		...addressStatement
	};

	return databaseConnector.inquiry.update({
		where: { id },
		data: inquiryData,
		include: {
			address: true
		}
	});
};

/**
 * @param {number} id
 */
const deleteInquiryById = (id) => {
	return databaseConnector.inquiry.delete({ where: { id } });
};

export default { getInquiryById, createInquiryById, updateInquiryById, deleteInquiryById };
