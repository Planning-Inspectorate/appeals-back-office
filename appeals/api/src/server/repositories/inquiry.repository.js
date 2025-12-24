import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.Inquiry} Inquiry */
/** @typedef {import('@pins/appeals.api').Schema.Address} Address */
/** @typedef {import('@pins/appeals.api').Appeals.CreateInquiry} CreateInquiry */
/** @typedef {import('@pins/appeals.api').Appeals.InquiryAddress} InquiryAddress */
/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
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
 *  estimatedDays?: number;
 *  address?: Omit<Address, 'id'> | undefined | null
 *  addressId?: number | undefined
 * }} data
 */
const updateInquiryById = async (id, data) => {
	const { appealId, inquiryStartTime, inquiryEndTime, address, addressId, estimatedDays } = data;

	let addressStatement = {};
	const existingInquiry = await databaseConnector.inquiry.findUnique({
		where: { id },
		include: { address: true }
	});

	if (addressId) {
		// If an addressId is provided, connect to that address
		addressStatement = { address: { connect: { id: addressId } } };

		// OPTIONAL: If you also want to update this address with provided address data:
		if (address) {
			addressStatement = {
				address: {
					update: {
						where: { id: addressId },
						data: {
							addressLine1: address.addressLine1 ?? null,
							addressLine2: address.addressLine2 ?? null,
							addressTown: address.addressTown ?? null,
							addressCounty: address.addressCounty ?? null,
							postcode: address.postcode ?? null,
							addressCountry: address.addressCountry ?? null
						}
					}
				}
			};
		}
	} else if (address === null) {
		// If address is null, disconnect it
		addressStatement = { address: { disconnect: true } };
	} else if (address) {
		// If address object is provided (without addressId)
		if (existingInquiry?.address) {
			// Update existing linked address
			addressStatement = {
				address: {
					update: {
						addressLine1: address.addressLine1 ?? null,
						addressLine2: address.addressLine2 ?? null,
						addressTown: address.addressTown ?? null,
						addressCounty: address.addressCounty ?? null,
						postcode: address.postcode ?? null,
						addressCountry: address.addressCountry ?? null
					}
				}
			};
		} else {
			// Create new address if none exists
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
		}
	}

	if (address) {
		if (addressId) {
			// Update existing address
			addressStatement = {
				address: {
					update: {
						addressLine1: address.addressLine1 ?? null,
						addressLine2: address.addressLine2 ?? null,
						addressTown: address.addressTown ?? null,
						addressCounty: address.addressCounty ?? null,
						postcode: address.postcode ?? null,
						addressCountry: address.addressCountry ?? null
					}
				}
			};
		} else {
			// Create new address if none exists
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
		}
	}

	const inquiryData = {
		...(appealId && {
			appeal: {
				connect: { id: appealId }
			}
		}),
		inquiryStartTime,
		inquiryEndTime,
		estimatedDays: estimatedDays ? Number(estimatedDays) : null,
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
