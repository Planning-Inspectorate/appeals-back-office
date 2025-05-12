/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Appeals.HearingResponse} HearingResponse */

/**
 * @param {Appeal} appeal
 * @returns {HearingResponse | void}
 */
const formatHearing = (appeal) => {
	const { hearing } = appeal;

	if (hearing) {
		return {
			appealId: hearing.appealId,
			hearingStartTime: hearing.hearingStartTime,
			hearingEndTime: hearing.hearingEndTime,
			hearingId: hearing.id,
			addressId: hearing.addressId,
			address: hearing.address
		};
	}
};

export { formatHearing };
