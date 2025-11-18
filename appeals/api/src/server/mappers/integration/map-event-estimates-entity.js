/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.HearingEstimate & {appeal: Appeal}} HearingEstimateWithAppeal */
/** @typedef {import('@pins/appeals.api').Schema.InquiryEstimate & {appeal: Appeal}} InquiryEstimateWithAppeal */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealEventEstimate} AppealEventEstimate */

/**
 *
 * @param {HearingEstimateWithAppeal | InquiryEstimateWithAppeal} eventEstimate
 * @returns {AppealEventEstimate}
 */
export const mapEventEstimateEntity = (eventEstimate) => {
	return {
		id: eventEstimate.id,
		caseReference: eventEstimate.appeal.reference ?? '',
		preparationTime: eventEstimate.preparationTime ? Number(eventEstimate.preparationTime) : 0,
		sittingTime: eventEstimate.sittingTime ? Number(eventEstimate.sittingTime) : 0,
		reportingTime: eventEstimate.reportingTime ? Number(eventEstimate.reportingTime) : 0
	};
};
