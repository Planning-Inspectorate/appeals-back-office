import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appealData
 * @param {{ preparationTime: string, sittingTime: string, reportingTime: string }} values
 * @param {Record<string, any>} errors
 * @returns {PageContent}
 */
export function addEstimatesPage(appealData, values, errors = {}) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const labelClasses = 'govuk-label--m govuk-!-margin-bottom-3';
	const classes = 'govuk-input--width-4';
	const suffix = { text: 'days' };

	/** @type {PageComponent} */
	const preparationTimeComponent = {
		type: 'input',
		parameters: {
			name: 'preparation-time',
			id: 'preparation-time',
			label: {
				text: 'Estimated preparation time',
				classes: labelClasses
			},
			value: values.preparationTime,
			...(errors['preparation-time'] && { errorMessage: { text: errors['preparation-time'].msg } }),
			classes,
			suffix
		}
	};

	/** @type {PageComponent} */
	const sittingTimeComponent = {
		type: 'input',
		parameters: {
			name: 'sitting-time',
			id: 'sitting-time',
			label: {
				text: 'Estimated sitting time',
				classes: labelClasses
			},
			value: values.sittingTime,
			...(errors['sitting-time'] && { errorMessage: { text: errors['sitting-time'].msg } }),
			classes,
			suffix
		}
	};

	/** @type {PageComponent} */
	const reportingTimeComponent = {
		type: 'input',
		parameters: {
			name: 'reporting-time',
			id: 'reporting-time',
			label: {
				text: 'Estimated reporting time',
				classes: labelClasses
			},
			value: values.reportingTime,
			...(errors['reporting-time'] && { errorMessage: { text: errors['reporting-time'].msg } }),
			classes,
			suffix
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: `Hearing estimates - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Hearing estimates',
		pageComponents: [preparationTimeComponent, sittingTimeComponent, reportingTimeComponent]
	};

	return pageContent;
}
