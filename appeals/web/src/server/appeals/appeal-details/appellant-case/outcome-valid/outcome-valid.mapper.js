import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {number} appealId
 * @param {string} appealReference
 * @param {string} dateValidDay
 * @param {string} dateValidMonth
 * @param {string} dateValidYear
 * @returns {PageContent}
 */
export function updateValidDatePage(
	appealId,
	appealReference,
	dateValidDay,
	dateValidMonth,
	dateValidYear
) {
	const title = 'Enter valid date for case';

	/** @type {PageComponent} */
	const validDateTextComponent = {
		type: 'html',
		parameters: {
			html: `<p class="govuk-body">This is the date all case documentation was received and the appeal was valid.</p>`
		}
	};

	/** @type {PageComponent} */
	const selectDateComponent = {
		type: 'date-input',
		parameters: {
			id: 'valid-date',
			namePrefix: 'valid-date',
			fieldset: {
				legend: {
					text: '',
					classes: 'govuk-fieldset__legend--m'
				}
			},
			hint: {
				text: 'For example, 27 3 2023'
			},
			items: [
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
					name: 'day',
					value: dateValidDay || ''
				},
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
					name: 'month',
					value: dateValidMonth || ''
				},
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-4',
					name: 'year',
					value: dateValidYear || ''
				}
			]
		}
	};

	/** @type {PageComponent} */
	const insetTextComponent = {
		type: 'inset-text',
		parameters: {
			text: 'Confirming will inform the relevant parties of the valid date'
		}
	};

	const pageContent = {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/appellant-case`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		backLinkText: 'Back',
		heading: title,
		submitButtonText: 'Confirm',
		prePageComponents: [validDateTextComponent],
		pageComponents: [selectDateComponent, insetTextComponent]
	};

	return pageContent;
}
