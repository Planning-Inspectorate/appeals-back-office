import { appealShortReference } from '#lib/appeals-formatter.js';

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

	/** @type {PageComponent} */
	const dateComponent = {
		type: 'date-input',
		parameters: {
			id: 'hearing-date',
			namePrefix: 'hearing-date',
			fieldset: {
				legend: {
					text: 'Date',
					classes: 'govuk-fieldset__legend--m'
				}
			},
			hint: {
				text: 'For example, 31 3 2025'
			},
			items: [
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
					name: 'day',
					value: date?.day || ''
				},
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
					name: 'month',
					value: date?.month || ''
				},
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-4',
					name: 'year',
					value: date?.year || ''
				}
			]
		}
	};

	/** @type {PageComponent} */
	const timeComponent = {
		type: 'time-input',
		parameters: {
			id: 'hearing-time',
			namePrefix: 'hearing-time',
			fieldset: {
				legend: {
					text: 'Time',
					classes: 'govuk-fieldset__legend--m',
					isPageHeading: false
				}
			},
			showLabels: true,
			hint: {
				text: 'For example, 9:00 or 13:15'
			},
			hour: {
				value: time?.hour
			},
			minute: {
				value: time?.minute
			}
		}
	};

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
