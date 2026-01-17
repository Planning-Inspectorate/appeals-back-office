import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate, dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import { dateInput, simpleHtmlComponent, yesNoInput } from '#lib/mappers/index.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { LENGTH_300 } from '@pins/appeals/constants/support.js';

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
 * @param {string} [routePath]
 * @param {string} [otherInformationDetailsRadio]
 * @param {string} [otherInformationDetails]
 * @param {import("@pins/express").ValidationErrors | undefined} [errors]
 * @returns {PageContent}
 */
export const updateEnforcementOtherInformationPage = (
	appealData,
	routePath,
	otherInformationDetailsRadio,
	otherInformationDetails,
	errors
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		heading: 'Do you want to add any other information?',
		hint: 'We will share the other information with the relevant parties.',
		backLinkUrl:
			routePath === '/enforcement-other-information'
				? `/appeals-service/appeal-details/${appealData.appealId}/appellant-case/invalid/enforcement-notice-reason`
				: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case/valid/enforcement/ground-a`,
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

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {PageContent}
 * @description
 */
export function checkAndConfirmEnforcementPage(request) {
	const {
		currentAppeal,
		session: {
			enforcementDecision: {
				outcome,
				appealGroundABarred,
				otherInformationDetails,
				updatedValidDateDay,
				updatedValidDateMonth,
				updatedValidDateYear
			}
		}
	} = request;
	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`;

	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Review decision'
					},
					value: {
						text: capitalizeFirstLetter(outcome)
					},
					actions: {
						items: [
							{
								href: baseUrl,
								text: 'Change',
								visuallyHiddenText: 'review decision'
							}
						]
					}
				},
				{
					key: {
						text: 'Is the appeal ground (a) barred?'
					},
					value: {
						text: capitalizeFirstLetter(appealGroundABarred)
					},
					actions: {
						items: [
							{
								href: `${baseUrl}/valid/enforcement/ground-a`,
								text: 'Change',
								visuallyHiddenText: 'Appeal ground (a) barred'
							}
						]
					}
				},
				{
					key: {
						text: 'Do you want to add any other information?'
					},
					value: {
						...(otherInformationDetails
							? {
									html: renderPageComponentsToHtml([
										{
											type: 'show-more',
											parameters: {
												text: `Yes: ${otherInformationDetails}`,
												maximumBeforeHiding: LENGTH_300,
												toggleTextCollapsed: 'Show more',
												toggleTextExpanded: 'Show less'
											}
										}
									])
								}
							: { text: 'No' })
					},
					actions: {
						items: [
							{
								href: `${baseUrl}/valid/enforcement/other-information`,
								text: 'Change',
								visuallyHiddenText: 'Other information'
							}
						]
					}
				},
				{
					key: {
						text: 'Valid date for case'
					},
					value: {
						text: dateISOStringToDisplayDate(
							dayMonthYearHourMinuteToISOString({
								day: updatedValidDateDay,
								month: updatedValidDateMonth,
								year: updatedValidDateYear
							})
						)
					},
					actions: {
						items: [
							{
								href: `${baseUrl}/valid/enforcement/date`,
								text: 'Change',
								visuallyHiddenText: 'Valid date'
							}
						]
					}
				}
			]
		}
	};

	/**@type {PageComponent[]} */
	const pageComponents = [summaryListComponent];

	pageComponents.push(
		simpleHtmlComponent(
			'p',
			{
				class: 'govuk-body'
			},
			'We will mark the appeal as valid and send an email to the relevant parties.'
		)
	);

	return {
		title: 'Check details and mark appeal as valid',
		backLinkUrl: `${baseUrl}/valid/enforcement/date`,
		preHeading: `Appeal ${appealShortReference(currentAppeal.appealReference)}`,
		heading: 'Check details and mark appeal as valid',
		submitButtonText: 'Mark appeal as valid',
		pageComponents
	};
}
