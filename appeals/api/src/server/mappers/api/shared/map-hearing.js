/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.HearingResponse} HearingResponse */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {HearingResponse|undefined}
 */
export const mapHearing = (data) => {
	const { appeal } = data;

	const hearing = Array.isArray(appeal.hearing)
		? appeal.hearing[0]
		: appeal.hearing;

	if (hearing) {
		return {
			hearingId: hearing.id,
			hearingStartTime: hearing.hearingStartTime?.toISOString() || '',
			hearingEndTime: hearing.hearingEndTime?.toISOString() || '',
			estimatedDays: hearing.estimatedDays
				? Number(hearing.estimatedDays)
				: undefined,
			addressId: hearing.addressId || undefined,
			...(hearing.address && {
				address: {
					addressLine1: hearing.address.addressLine1 || undefined,
					addressLine2: hearing.address.addressLine2 || undefined,
					town: hearing.address.addressTown || undefined,
					county: hearing.address.addressCounty || undefined,
					postcode: hearing.address.postcode || undefined
				}
			})
		};
	}
};
