/**
 *
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @param {String} fieldName
 * @returns
 */
export const assembleClassesFromErrors = (errors, fieldName = 'date') => {
	let classes = {
		day: 'govuk-input govuk-date-input__input',
		month: 'govuk-input govuk-date-input__input',
		year: 'govuk-input govuk-date-input__input'
	};
	if (errors) {
		if (
			errors[fieldName + 'day']?.param === 'all-fields' ||
			errors[fieldName + 'month']?.param === 'all-fields' ||
			errors[fieldName + 'year']?.param === 'all-fields'
		) {
			classes['day'] += ' govuk-input--error';
			classes['month'] += ' govuk-input--error';
			classes['year'] += ' govuk-input--error';
		}
		if (errors[fieldName + 'day']) {
			classes['day'] += ' govuk-input--error';
		}
		if (errors[fieldName + 'month']) {
			classes['month'] += ' govuk-input--error';
		}
		if (errors[fieldName + 'year']) {
			classes['year'] += ' govuk-input--error';
		}
	}
	return classes;
};
/**
 *
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @param {String} fieldName
 * @returns
 */
export const assembleDocumentDateClassesFromErrors = (errors, fieldName = 'date') => {
	let classes = {
		day: 'govuk-input govuk-date-input__input',
		month: 'govuk-input govuk-date-input__input',
		year: 'govuk-input govuk-date-input__input'
	};
	if (errors && errors[fieldName]) {
		if (
			errors[fieldName]?.param === 'all-fields' ||
			errors[fieldName]?.param === 'all-fields-day' ||
			errors[fieldName]?.param === 'all-fields-month' ||
			errors[fieldName]?.param === 'all-fields-year'
		) {
			classes['day'] += ' govuk-input--error';
			classes['month'] += ' govuk-input--error';
			classes['year'] += ' govuk-input--error';
		}
		if (errors[fieldName].param === 'day') {
			classes['day'] += ' govuk-input--error';
		}
		if (errors[fieldName].param === 'month') {
			classes['month'] += ' govuk-input--error';
		}
		if (errors[fieldName].param === 'year') {
			classes['year'] += ' govuk-input--error';
		}
	}
	return classes;
};
