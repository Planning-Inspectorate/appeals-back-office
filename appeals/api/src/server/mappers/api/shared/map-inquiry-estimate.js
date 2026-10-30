/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.InquiryEstimate} InquiryEstimate */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {InquiryEstimate|undefined}
 */
export const mapInquiryEstimate = (data) => {
	const { appeal } = data;

	const inquiryEstimate = Array.isArray(appeal.inquiryEstimate)
		? appeal.inquiryEstimate[0]
		: appeal.inquiryEstimate;

	if (inquiryEstimate) {
		return {
			preparationTime: Number(inquiryEstimate.preparationTime),
			sittingTime: Number(inquiryEstimate.sittingTime),
			reportingTime: Number(inquiryEstimate.reportingTime)
		};
	}
};
