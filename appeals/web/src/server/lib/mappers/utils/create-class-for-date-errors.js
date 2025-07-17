/**
 * @typedef {'day' | 'month' | 'year'} DateField
 */

/**
 * @typedef {Object} DateClasses
 * @property {string} day - CSS classes for the day input.
 * @property {string} month - CSS classes for the month input.
 * @property {string} year - CSS classes for the year input.
 */

/**
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @param {String} fieldName
 * @returns {DateClasses} Classes object for day, month, and year inputs.
 */
export const assembleClassesFromErrors = (errors, fieldName = 'date') => {
	const baseClass = 'govuk-input govuk-date-input__input';
	const errorClass = ' govuk-input--error';

	const classes = {
		day: baseClass,
		month: baseClass,
		year: baseClass
	};

	if (!errors) return classes;

	/** @type {DateField[]} */
	const fields = ['day', 'month', 'year'];
	/** @type {[DateField, DateField][]} */
	const pairs = [
		['day', 'month'],
		['day', 'year'],
		['month', 'year']
	];

	const hasAllFieldsError = fields.some(
		(field) => errors[fieldName + field]?.param === 'all-fields'
	);

	if (hasAllFieldsError) {
		fields.forEach((field) => (classes[field] += errorClass));
		return classes;
	}

	fields.forEach((field) => {
		if (errors[fieldName + field]) {
			classes[field] += errorClass;

			const param = errors[fieldName + field].param;
			pairs.forEach(([field1, field2]) => {
				if (param === `${field1}-${field2}`) {
					classes[field1] += errorClass;
					classes[field2] += errorClass;
				}
			});
		}
	});

	return classes;
};
/**
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @param {String} fieldName
 * @returns {DateClasses} Classes object for day, month, and year inputs.
 */
export const assembleDocumentDateClassesFromErrors = (errors, fieldName = 'date') => {
	const baseClass = 'govuk-input govuk-date-input__input';
	const errorClass = ' govuk-input--error';

	const classes = {
		day: baseClass,
		month: baseClass,
		year: baseClass
	};

	if (!errors || !errors[fieldName]) return classes;

	const { param } = errors[fieldName];

	if (param?.startsWith('all-fields')) {
		/** @type {DateField[]} */ (Object.keys(classes)).forEach((field) => {
			classes[field] += errorClass;
		});
		return classes;
	}

	/** @type {DateField[]} */
	const fields = ['day', 'month', 'year'];
	fields.forEach((field) => {
		if (param === field) {
			classes[field] += errorClass;
		}
	});

	/** @type {[DateField, DateField][]} */
	const pairs = [
		['day', 'month'],
		['day', 'year'],
		['month', 'year']
	];
	pairs.forEach(([field1, field2]) => {
		if (param === `${field1}-${field2}`) {
			classes[field1] += errorClass;
			classes[field2] += errorClass;
		}
	});

	return classes;
};
