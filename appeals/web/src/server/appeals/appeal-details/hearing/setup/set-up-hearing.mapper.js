import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateInput } from '#lib/mappers/components/page-components/date.js';
import { timeInput } from '#lib/mappers/components/page-components/time.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appealData
 * @param {{ day: string, month: string, year: string, hour: string, minute: string }} values
 * @returns {PageContent}
 */
export function setUpHearingPage(appealData, values) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const date = { day: values.day || '', month: values.month || '', year: values.year || '' };
	const time = { hour: values.hour || '', minute: values.minute || '' };

	const dateComponent = dateInput({
		name: 'hearing-date',
		id: 'hearing-date',
		namePrefix: 'hearing-date',
		legendText: 'Date',
		legendClasses: 'govuk-fieldset__legend--m',
		hint: 'For example, 31 3 2025',
		value: date
	});

	const timeComponent = timeInput({
		id: 'hearing-time',
		hint: 'For example, 9:00 or 13:15',
		value: { hour: time?.hour, minute: time?.minute },
		legendText: 'Time',
		legendClasses: 'govuk-fieldset__legend--m',
		showLabels: true
	});

	/** @type {PageContent} */
	const pageContent = {
		title: `Date and time - set up hearing - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: `Appeal ${shortAppealReference} - set up hearing`,
		heading: 'Date and time',
		pageComponents: [dateComponent, timeComponent]
	};

	return pageContent;
}
