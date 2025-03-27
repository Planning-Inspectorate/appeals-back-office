/**
 * @typedef {import('../../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateInput } from '#lib/mappers/components/page-components/date.js';
import { dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';

/**
 * @param {Appeal} appealData
 * @param {string|null} existingValue
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export const changeInfrastructureLevyAdoptedDate = (appealData, existingValue, backLinkUrl) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Levy adoption date',
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			dateInput({
				name: 'infrastructureLevyAdoptedDate',
				namePrefix: 'levy-adopted-date',
				legendText: 'When was the community infrastructure levy formally adopted?',
				legendIsPageHeading: true,
				value: dateISOStringToDayMonthYearHourMinute(existingValue)
			})
		]
	};
	return pageContent;
};
