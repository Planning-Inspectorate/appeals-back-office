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

	if (appeal.hearing) {
		return {
			hearingId: appeal.hearing.id,
			hearingStartTime: appeal.hearing.hearingStartTime?.toISOString() || '',
			hearingEndTime: appeal.hearing.hearingEndTime?.toISOString() || '',
			estimatedDays: appeal.hearing.estimatedDays || undefined,
			addressId: appeal.hearing.addressId || undefined,
			...(appeal.hearing.address && {
				address: {
					addressLine1: appeal.hearing.address.addressLine1 || undefined,
					addressLine2: appeal.hearing.address.addressLine2 || undefined,
					town: appeal.hearing.address.addressTown || undefined,
					county: appeal.hearing.address.addressCounty || undefined,
					postcode: appeal.hearing.address.postcode || undefined
				}
			})
		};
	}
};
