import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/index.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {{ 'day': string, 'month': string, 'year': string }} RequestDate */
/** @typedef {RequestDate} ReqBody */

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {ReqBody} date
 * @param {string} backLinkUrl
 * @returns {PageContent}
 * */
export const dateSubmitted = (appealDetails, errors, date, backLinkUrl) => ({
	title: 'When was the supporting document submitted?',
	backLinkUrl,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	pageComponents: [
		dateInput({
			id: 'date',
			name: 'date',
			value:
				date.day && date.month && date.year
					? date
					: dateISOStringToDayMonthYearHourMinute(new Date().toISOString()),
			legendText: 'When was the supporting document submitted?',
			legendIsPageHeading: true,
			hint: 'For example, 27 3 2024'
		})
	]
});
