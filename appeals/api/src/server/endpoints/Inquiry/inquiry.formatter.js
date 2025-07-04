/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Appeals.InquiryResponse} InquiryResponse */

/**
 * @param {Appeal} appeal
 * @returns {InquiryResponse | void}
 */
const formatInquiry = (appeal) => {
	const { inquiry } = appeal;

	if (inquiry) {
		return {
			appealId: inquiry.appealId,
			inquiryStartTime: inquiry.inquiryStartTime,
			inquiryEndTime: inquiry.inquiryEndTime,
			inquiryId: inquiry.id,
			addressId: inquiry.addressId,
			address: inquiry.address
		};
	}
};

export { formatInquiry };
