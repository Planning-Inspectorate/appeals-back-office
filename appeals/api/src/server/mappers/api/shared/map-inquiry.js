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

	const inquiry = Array.isArray(appeal.inquiry)
		? appeal.inquiry[0]
		: appeal.inquiry;

	if (inquiry) {
		return {
			inquiryId: inquiry?.id,
			inquiryStartTime: inquiry.inquiryStartTime?.toISOString() || '',
			inquiryEndTime: inquiry.inquiryEndTime?.toISOString() || '',
			addressId: inquiry.addressId || undefined,
			estimatedDays: inquiry.estimatedDays || undefined,
			...(inquiry.address && {
				address: {
					addressLine1: inquiry.address.addressLine1 || undefined,
					addressLine2: inquiry.address.addressLine2 || undefined,
					town: inquiry.address.addressTown || undefined,
					county: inquiry.address.addressCounty || undefined,
					postcode: inquiry.address.postcode || undefined
				}
			})
		};
	}
};
