/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.InquiryResponse} InquiryResponse */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {InquiryResponse|undefined}
 */
export const mapInquiry = (data) => {
	const { appeal } = data;

	if (appeal.inquiry) {
		return {
			inquiryId: appeal.inquiry?.id,
			inquiryStartTime: appeal.inquiry.inquiryStartTime?.toISOString() || '',
			inquiryEndTime: appeal.inquiry.inquiryEndTime?.toISOString() || '',
			addressId: appeal.inquiry.addressId || undefined,
			...(appeal.inquiry.address && {
				address: {
					addressLine1: appeal.inquiry.address.addressLine1 || undefined,
					addressLine2: appeal.inquiry.address.addressLine2 || undefined,
					town: appeal.inquiry.address.addressTown || undefined,
					county: appeal.inquiry.address.addressCounty || undefined,
					postcode: appeal.inquiry.address.postcode || undefined
				}
			})
		};
	}
};
