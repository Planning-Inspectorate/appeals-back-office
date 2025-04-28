/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.HearingResponse} HearingResponse */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {HearingResponse|undefined}
 */
export const mapSiteVisit = (data) => {
	const { appeal } = data;

	if (appeal.hearing) {
		return {
			hearingId: appeal.hearing.id,
			hearingStartTime: appeal.hearing.hearingStartTime?.toISOString() || '',
			hearingEndTime: appeal.hearing.hearingEndTime?.toISOString() || ''
		};
	}
};
