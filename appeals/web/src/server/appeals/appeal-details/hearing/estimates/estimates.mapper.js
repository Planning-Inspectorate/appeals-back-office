import { appealShortReference } from '#lib/appeals-formatter.js';
import { formatDays } from '#lib/dates.js';
import { capitalize } from 'lodash-es';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appealData
 * @param {{ preparationTime: string, sittingTime: string, reportingTime: string }} values
 * @param {Record<string, any>} errors
 * @returns {PageContent}
 */
export function timingsPage(appealData, values, errors = {}) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const labelClasses = 'govuk-label--m govuk-!-margin-bottom-3';
	const classes = 'govuk-input--width-4';
	const suffix = { text: 'days' };

	/** @type {PageComponent} */
	const preparationTimeComponent = {
		type: 'input',
		parameters: {
			name: 'preparationTime',
			id: 'preparation-time',
			label: {
				text: 'Estimated preparation time',
				classes: labelClasses
			},
			value: values.preparationTime,
			...(errors.preparationTime && { errorMessage: { text: errors.preparationTime.msg } }),
			classes,
			suffix
		}
	};

	/** @type {PageComponent} */
	const sittingTimeComponent = {
		type: 'input',
		parameters: {
			name: 'sittingTime',
			id: 'sitting-time',
			label: {
				text: 'Estimated sitting time',
				classes: labelClasses
			},
			value: values.sittingTime,
			...(errors.sittingTime && { errorMessage: { text: errors.sittingTime.msg } }),
			classes,
			suffix
		}
	};

	/** @type {PageComponent} */
	const reportingTimeComponent = {
		type: 'input',
		parameters: {
			name: 'reportingTime',
			id: 'reporting-time',
			label: {
				text: 'Estimated reporting time',
				classes: labelClasses
			},
			value: values.reportingTime,
			...(errors.reportingTime && { errorMessage: { text: errors.reportingTime.msg } }),
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

/**
 * @param {Appeal} appealData
 * @param {{ preparationTime?: string, sittingTime?: string, reportingTime?: string }} values
 * @param {string} action
 * @returns {PageContent}
 */
export function checkDetailsPage(appealData, values = {}, action) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const actionSlug = action === 'update' ? 'change' : action;

	const rows = [
		{ key: 'Estimated preparation time', value: values.preparationTime },
		{ key: 'Estimated sitting time', value: values.sittingTime },
		{ key: 'Estimated reporting time', value: values.reportingTime }
	].map((row) => ({
		key: { text: row.key },
		value: { text: formatDays(row.value) },
		actions: {
			items: [
				{
					href: `/appeals-service/appeal-details/${appealData.appealId}/hearing/estimates/${actionSlug}/timings`,
					text: 'Change',
					visuallyHiddenText: row.key,
					attributes: { 'data-cy': `change-${row.key.toLowerCase().replaceAll(' ', '-')}` }
				}
			]
		}
	}));

	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: { rows }
	};

	/** @type {PageContent} */
	const pageContent = {
		title: `Check details and ${action} hearing estimates - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/hearing/estimates/${actionSlug}/timings`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Check details and ${action} hearing estimates`,
		pageComponents: [summaryListComponent],
		submitButtonText: `${capitalize(action)} hearing estimates`
	};

	return pageContent;
}
