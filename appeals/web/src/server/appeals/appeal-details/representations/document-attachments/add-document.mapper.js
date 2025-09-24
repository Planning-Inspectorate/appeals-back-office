import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDayMonthYearHourMinute, getTodaysISOString } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/index.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {{ 'day': string, 'month': string, 'year': string }} RequestDate */
/** @typedef {RequestDate} ReqBody */

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {ReqBody} date
 * @param {string} backLinkUrl
 * @param {Object} params
 * @param {string} [params.pageHeadingTextOverride]
 * @returns {PageContent}
 * */
export const dateSubmitted = (
	appealDetails,
	errors,
	date,
	backLinkUrl,
	{ pageHeadingTextOverride }
) => ({
	title: pageHeadingTextOverride || 'When was the supporting document submitted?',
	backLinkUrl,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	pageComponents: [
		dateInput({
			id: 'date',
			name: 'date',
			value:
				date.day && date.month && date.year
					? date
					: dateISOStringToDayMonthYearHourMinute(getTodaysISOString()),
			legendText: pageHeadingTextOverride || 'When was the supporting document submitted?',
			legendIsPageHeading: true,
			hint: 'For example, 27 3 2024',
			errors: errors
		})
	]
});
