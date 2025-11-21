import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/index.js';
import { contactPlanningInspectorateDateField } from './contact-planning-inspectorate-date.constants.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../../../../appeals/appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 */

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {{day: string, month: string, year: string}} dateEntered
 * @returns {PageContent}
 */
export const changeContactPlanningInspectorateDatePage = (
	appealData,
	appellantCaseData,
	errors,
	dateEntered
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let { day, month, year } = dateEntered;

	if (!errors && appellantCaseData.enforcementNotice?.contactPlanningInspectorateDate) {
		const formattedDate = dateISOStringToDayMonthYearHourMinute(
			appellantCaseData.enforcementNotice.contactPlanningInspectorateDate
		);

		day = String(formattedDate.day);
		month = String(formattedDate.month);
		year = String(formattedDate.year);
	}

	// Correct automatic error formatting
	if (errors && errors['contact-planning-inspectorate-date-day']?.msg) {
		const msg = errors['contact-planning-inspectorate-date-day'].msg;
		errors['contact-planning-inspectorate-date-day'].msg = msg
			.replace('The the', 'the')
			.replace('planning inspectorate', 'Planning Inspectorate');
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Contact Planning Inspectorate date - validation - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		// /** @type {PageComponent} */

		pageComponents: [
			dateInput({
				name: contactPlanningInspectorateDateField,
				id: contactPlanningInspectorateDateField,
				namePrefix: contactPlanningInspectorateDateField,
				value: {
					day: day,
					month: month,
					year: year
				},
				legendText: `When did you contact the Planning Inspectorate?`,
				legendIsPageHeading: true,
				hint: 'For example, 31 3 2024',
				errors: errors
			})
		]
	};

	return pageContent;
};
