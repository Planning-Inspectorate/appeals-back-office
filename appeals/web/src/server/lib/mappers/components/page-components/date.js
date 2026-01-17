import {
	assembleClassesFromErrors,
	assembleDocumentDateClassesFromErrors
} from '#lib/mappers/utils/create-class-for-date-errors.js';
import { kebabCase } from 'lodash-es';

/**
 * @typedef {import('#appeals/appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 */

/**
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.id]
 * @param {string} [params.namePrefix]
 * @param {DayMonthYearHourMinute|null} [params.value]
 * @param {string} [params.legendText]
 * @param {boolean} [params.legendIsPageHeading=false]
 * @param {string} [params.legendClasses]
 * @param {string} [params.descriptionHtml]
 * @param {string} [params.hint]
 * @param {import("@pins/express").ValidationErrors | undefined} [params.errors]
 *
 * @returns {PageComponent}
 */
export function dateInput({
	name,
	id,
	namePrefix,
	value,
	legendText,
	legendIsPageHeading = false,
	legendClasses = 'govuk-fieldset__legend--l',
	descriptionHtml,
	hint,
	errors
}) {
	const formattedNamePrefix = namePrefix ? `${namePrefix}-` : '';
	const hasErrors =
		errors?.[formattedNamePrefix + 'day']?.msg ||
		errors?.[formattedNamePrefix + 'month']?.msg ||
		errors?.[formattedNamePrefix + 'year']?.msg;

	const classes = assembleClassesFromErrors(errors, formattedNamePrefix);
	const defaultId = id || kebabCase(name);

	let finalHint;

	if (descriptionHtml || hint) {
		let hintHtml = descriptionHtml || '';

		if (hint) {
			hintHtml += `<div class="govuk-hint">${hint}</div>`;
		}

		finalHint = {
			html: hintHtml
		};
	}

	/** @type {PageComponent} */
	const component = {
		type: 'date-input',
		parameters: {
			id: defaultId || kebabCase(name),
			items: [
				{
					label: 'Day',
					name: `${formattedNamePrefix}day`,
					id: `${formattedNamePrefix}day`,
					classes: `govuk-input--width-2 ${classes.day}`,
					value: value?.day
				},
				{
					label: 'Month',
					name: `${formattedNamePrefix}month`,
					id: `${formattedNamePrefix}month`,
					classes: `govuk-input--width-2 ${classes.month}`,
					value: value?.month
				},
				{
					label: 'Year',
					name: `${formattedNamePrefix}year`,
					id: `${formattedNamePrefix}year`,
					classes: `govuk-input--width-4 ${classes.year}`,
					value: value?.year
				}
			],
			hint: finalHint,
			errorMessage:
				errors && hasErrors
					? {
							html: [
								errors[formattedNamePrefix + 'day']?.msg,
								errors[formattedNamePrefix + 'month']?.msg,
								errors[formattedNamePrefix + 'year']?.msg
							]
								.filter(Boolean)
								.join('<br>')
						}
					: undefined
		}
	};

	if (legendText) {
		component.parameters.fieldset = {
			legend: {
				text: legendText,
				isPageHeading: legendIsPageHeading,
				classes: legendClasses
			}
		};
	}

	return component;
}

/**
 *
 * @param {Object} params
 * @param {string} [params.id]
 * @param {DayMonthYearHourMinute|null} [params.value]
 * @param {string} params.legendText
 * @param {boolean} [params.legendIsPageHeading=false]
 * @param {string} [params.legendClasses]
 * @param {string} [params.hint]
 * @param {boolean} [params.appealDocument]
 * @param {number} [params.appealDocumentIndex]
 * @param {import("@pins/express").ValidationErrors | undefined} [params.errors]
 *
 * @returns {PageComponent}
 */
export function documentDateInput({
	value,
	legendText,
	legendIsPageHeading = false,
	legendClasses = 'govuk-fieldset__legend--l',
	hint,
	appealDocumentIndex,
	errors
}) {
	const hasErrors = errors && errors[`items[${appealDocumentIndex}].receivedDate`];
	const classes = assembleDocumentDateClassesFromErrors(
		errors,
		`items[${appealDocumentIndex}].receivedDate`
	);

	/** @type {PageComponent} */
	const component = {
		type: 'date-input',
		parameters: {
			id: `items[${appealDocumentIndex}]receivedDate`,
			namePrefix: `items[${appealDocumentIndex}][receivedDate]`,
			items: [
				{
					label: 'Day',
					name: '[day]',
					id: kebabCase(`items[${appealDocumentIndex}].receivedDate.day`),
					classes: `govuk-input--width-2 ${classes.day}`,
					value: value?.day
				},
				{
					label: 'Month',
					name: '[month]',
					id: kebabCase(`items[${appealDocumentIndex}].receivedDate.month`),
					classes: `govuk-input--width-2 ${classes.month}`,
					value: value?.month
				},
				{
					label: 'Year',
					name: '[year]',
					id: kebabCase(`items[${appealDocumentIndex}].receivedDate.year`),
					classes: `govuk-input--width-4 ${classes.year}`,
					value: value?.year
				}
			],
			hint: hint && {
				text: hint
			},
			errorMessage:
				errors && hasErrors
					? {
							html: [errors[`items[${appealDocumentIndex}].receivedDate`]?.msg]
						}
					: undefined
		}
	};

	if (legendText) {
		component.parameters.fieldset = {
			legend: {
				text: legendText,
				isPageHeading: legendIsPageHeading,
				classes: legendClasses
			}
		};
	}

	return component;
}
