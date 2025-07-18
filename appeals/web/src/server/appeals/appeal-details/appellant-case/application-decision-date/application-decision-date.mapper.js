/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/index.js';
import { applicaitonDecisionDateField } from './application-decision-date.constants.js';

/**
 * @typedef {import('../../../../appeals/appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 */

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {DayMonthYearHourMinute} storedSessionData
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export const changeApplicationDecisionDatePage = (
	appealData,
	appellantCaseData,
	storedSessionData,
	errors
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let day = '';
	let month = '';
	let year = '';

	if (storedSessionData?.day && storedSessionData?.month && storedSessionData?.year) {
		day = String(storedSessionData.day);
		month = String(storedSessionData.month);
		year = String(storedSessionData.year);
	} else if (appellantCaseData.applicationDecisionDate) {
		const formattedApplicationDecisionDate = dateISOStringToDayMonthYearHourMinute(
			appellantCaseData.applicationDecisionDate
		);

		day = String(formattedApplicationDecisionDate.day);
		month = String(formattedApplicationDecisionDate.month);
		year = String(formattedApplicationDecisionDate.year);
	}

	const title =
		appellantCaseData.applicationDecision == 'not_received'
			? 'What date was your decision due from the local planning authority?'
			: 'What’s the date on the decision letter from the local planning authority?​';

	/** @type {PageContent} */
	const pageContent = {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			dateInput({
				name: applicaitonDecisionDateField,
				id: applicaitonDecisionDateField,
				namePrefix: applicaitonDecisionDateField,
				value: {
					day: day,
					month: month,
					year: year
				},
				legendText: title,
				hint: 'For example, 27 3 2007',
				errors: errors
			})
		]
	};

	return pageContent;
};
