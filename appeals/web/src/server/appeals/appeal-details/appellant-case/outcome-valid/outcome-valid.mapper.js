import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateInput } from '#lib/mappers/index.js';

/**
 * @param {number} appealId
 * @param {string} appealReference
 * @param {string} dateValidDay
 * @param {string} dateValidMonth
 * @param {string} dateValidYear
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function updateValidDatePage(
	appealId,
	appealReference,
	dateValidDay,
	dateValidMonth,
	dateValidYear,
	errors
) {
	const title = 'Enter valid date for case';

	const descriptiveHtml = `<p class="govuk-body">This is the date all case documentation was received and the appeal was valid.</p>`;

	const selectDateComponent = dateInput({
		name: 'valid-date',
		id: 'valid-date',
		namePrefix: 'valid-date',
		value: {
			day: dateValidDay,
			month: dateValidMonth,
			year: dateValidYear
		},
		legendText: title,
		legendIsPageHeading: true,
		descriptionHtml: descriptiveHtml,
		hint: 'For example, 27 3 2023',
		errors: errors
	});

	/** @type {PageComponent} */
	const insetTextComponent = {
		type: 'inset-text',
		parameters: {
			text: 'Confirming will inform the relevant parties of the valid date'
		}
	};

	const pageContent = {
		title: title,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/appellant-case`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		backLinkText: 'Back',
		submitButtonText: 'Confirm',
		pageComponents: [selectDateComponent, insetTextComponent]
	};

	return pageContent;
}
