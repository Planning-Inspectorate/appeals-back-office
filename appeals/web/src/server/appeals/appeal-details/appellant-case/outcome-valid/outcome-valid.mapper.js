import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateInput, yesNoInput } from '#lib/mappers/index.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

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

/**
 * @param {Appeal} appealData
 * @param {string} origin
 * @param {string} [currentRadioValue]
 * @returns {PageContent}
 */
export const updateEnforcementGroundAPage = (appealData, origin, currentRadioValue) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Is the appeal ground (a) barred?',
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Is the appeal ground (a) barred?',
		pageComponents: [
			yesNoInput({
				name: 'enforcementGroundARadio',
				value: currentRadioValue,
				legendIsPageHeading: true
			})
		]
	};
	return pageContent;
};

/**
 * @param {Appeal} appealData
 * @param {string} [otherInformationDetailsRadio]
 * @param {string} [otherInformationDetails]
 * @param {import("@pins/express").ValidationErrors | undefined} [errors]
 * @returns {PageContent}
 */
export const updateEnforcementOtherInformationPage = (
	appealData,
	otherInformationDetailsRadio,
	otherInformationDetails,
	errors
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		heading: 'Do you want to add any other information?',
		hint: 'We will share the other information with the relevant parties.',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case/valid/enforcement/ground-a`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'otherInformationValidRadio',
					idPrefix: 'other-information-valid-radio',
					fieldset: {
						legend: {
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'Yes',
							text: 'Yes',
							checked: otherInformationDetailsRadio === 'Yes',
							conditional: {
								html: renderPageComponentsToHtml([
									{
										type: 'character-count',
										parameters: {
											id: 'other-information-details',
											name: 'otherInformationDetails',
											value: otherInformationDetails,
											maxLength: 1000,
											...(errors && {
												errorMessage: { text: errors.otherInformationDetails?.msg }
											}),
											label: {
												text: 'Enter other information',
												classes: 'govuk-label--s'
											}
										}
									}
								])
							}
						},
						{
							value: 'No',
							text: 'No',
							checked: otherInformationDetailsRadio === 'No'
						}
					]
				}
			}
		]
	};

	return pageContent;
};

/**
 * @param {number} appealId
 * @param {string} appealReference
 * @param {string} dateValidDay
 * @param {string} dateValidMonth
 * @param {string} dateValidYear
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function updateEnforcementValidDatePage(
	appealId,
	appealReference,
	dateValidDay,
	dateValidMonth,
	dateValidYear,
	errors
) {
	const title = 'Valid date';

	/** @type {HtmlPageComponent} */
	const descriptiveHtml = {
		type: 'html',
		parameters: {
			html: `
				<p class="govuk-body">This is the date all case documentation was received and the appeal was valid.</p>
				<label class="govuk-label govuk-label--m">Enter valid date for case</label>
			`
		}
	};
	const selectDateComponent = dateInput({
		name: 'valid-date',
		id: 'valid-date',
		namePrefix: 'valid-date',
		value: {
			day: dateValidDay,
			month: dateValidMonth,
			year: dateValidYear
		},
		hint: 'For example, 31 3 2025',
		errors: errors
	});

	const pageContent = {
		title,
		heading: title,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/appellant-case/valid/enforcement/other-information`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		backLinkText: 'Back',
		submitButtonText: 'Confirm',
		pageComponents: [descriptiveHtml, selectDateComponent]
	};

	return pageContent;
}
