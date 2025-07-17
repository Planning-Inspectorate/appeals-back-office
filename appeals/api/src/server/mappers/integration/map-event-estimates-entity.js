/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.HearingEstimate & {appeal: Appeal}} HearingEstimateWithAppeal */
/** @typedef {import('pins-data-model').Schemas.AppealEventEstimate} AppealEventEstimate */

/**
 *
 * @param {HearingEstimateWithAppeal} hearingEstimate
 * @returns {AppealEventEstimate}
 */
export const mapHearingEstimateEntity = (hearingEstimate) => {
	return {
		id: hearingEstimate.id,
		caseReference: hearingEstimate.appeal.reference ?? '',
		preparationTime: hearingEstimate.preparationTime ? Number(hearingEstimate.preparationTime) : 0,
		sittingTime: hearingEstimate.sittingTime ? Number(hearingEstimate.sittingTime) : 0,
		reportingTime: hearingEstimate.reportingTime ? Number(hearingEstimate.reportingTime) : 0
	};
};
