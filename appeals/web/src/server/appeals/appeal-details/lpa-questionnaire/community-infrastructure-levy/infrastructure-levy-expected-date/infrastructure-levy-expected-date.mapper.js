/**
 * @typedef {import('../../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/components/page-components/date.js';

/**
 * @param {Appeal} appealData
 * @param {string|null} existingValue
 * @param {string} backLinkUrl
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export const changeInfrastructureLevyExpectedDate = (
	appealData,
	existingValue,
	backLinkUrl,
	errors
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Expected levy adoption date',
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			dateInput({
				name: 'infrastructureLevyExpectedDate',
				namePrefix: 'levy-expected-date',
				legendText: 'When do you expect to formally adopt the community infrastructure levy?',
				legendIsPageHeading: true,
				value: dateISOStringToDayMonthYearHourMinute(existingValue),
				errors
			})
		]
	};
	return pageContent;
};
