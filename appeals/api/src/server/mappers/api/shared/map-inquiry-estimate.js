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

	if (appeal.inquiryEstimate) {
		return {
			preparationTime: Number(appeal.inquiryEstimate.preparationTime),
			sittingTime: Number(appeal.inquiryEstimate.sittingTime),
			reportingTime: Number(appeal.inquiryEstimate.reportingTime)
		};
	}
};
