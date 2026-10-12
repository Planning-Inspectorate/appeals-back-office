import { getExampleDateHint } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/components/page-components/date.js';
import { radiosInput } from '#lib/mappers/components/page-components/radio.js';
import { GENERIC_APPEAL_TYPES } from '@pins/appeals/constants/common.js';
import { fieldNameCaseType, fieldNameSubmissionDate } from './create-case.constants.js';

/**
 * @param {string} backLinkUrl
 * @param {string | undefined} selectedCaseType
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function selectCaseTypePage(backLinkUrl, selectedCaseType, errors) {
	const items = Object.values(GENERIC_APPEAL_TYPES).map((type) => ({
		value: type,
		text: type,
		checked: selectedCaseType === type
	}));

	/** @type {PageContent} */
	const pageContent = {
		title: 'Choose the case type',
		backLinkUrl,
		preHeading: 'Create a case',
		heading: 'Choose the case type',
		pageComponents: [
			radiosInput({
				name: fieldNameCaseType,
				idPrefix: fieldNameCaseType,
				items,
				value: selectedCaseType,
				errorMessage: errors?.[fieldNameCaseType]?.msg
			})
		]
	};

	return pageContent;
}

/**
 * @param {string} backLinkUrl
 * @param {{ day?: string, month?: string, year?: string } | undefined} submissionDate
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function submissionDatePage(backLinkUrl, submissionDate, errors) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'What date was the appeal submitted?',
		backLinkUrl,
		preHeading: 'Create a case',
		heading: 'What date was the appeal submitted?',
		pageComponents: [
			dateInput({
				name: fieldNameSubmissionDate,
				id: fieldNameSubmissionDate,
				namePrefix: fieldNameSubmissionDate,
				value: {
					day: submissionDate?.day,
					month: submissionDate?.month,
					year: submissionDate?.year
				},
				hint: `For example, ${getExampleDateHint(3, false)}`,
				errors
			})
		]
	};

	return pageContent;
}
