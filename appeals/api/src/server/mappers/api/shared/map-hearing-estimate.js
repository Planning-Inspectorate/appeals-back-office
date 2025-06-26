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

	if (appeal.hearingEstimate) {
		return {
			preparationTime: Number(appeal.hearingEstimate.preparationTime),
			sittingTime: Number(appeal.hearingEstimate.sittingTime),
			reportingTime: Number(appeal.hearingEstimate.reportingTime)
		};
	}
};
