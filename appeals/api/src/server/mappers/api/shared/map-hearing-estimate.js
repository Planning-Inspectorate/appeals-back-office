/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.HearingEstimate} HearingEstimate */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {HearingEstimate|undefined}
 */
export const mapHearingEstimate = (data) => {
	const { appeal } = data;

	const hearingEstimate = Array.isArray(appeal.hearingEstimate)
		? appeal.hearingEstimate[0]
		: appeal.hearingEstimate;

	if (hearingEstimate) {
		return {
			preparationTime: Number(hearingEstimate.preparationTime),
			sittingTime: Number(hearingEstimate.sittingTime),
			reportingTime: Number(hearingEstimate.reportingTime)
		};
	}
};
