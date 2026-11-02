import { dayMonthYearHourMinuteToDisplayDate, getExampleDateHint } from '#lib/dates.js';
import { editLink } from '#lib/edit-utilities.js';
import { checkYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
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

/**
 * @param {string} baseUrl
 * @param {Record<string, any>} sessionValues
 * @returns {PageContent}
 */
export function checkDetailsPage(baseUrl, sessionValues) {
	const caseType = sessionValues?.[fieldNameCaseType];
	const submissionDate = {
		day: sessionValues?.[`${fieldNameSubmissionDate}-day`],
		month: sessionValues?.[`${fieldNameSubmissionDate}-month`],
		year: sessionValues?.[`${fieldNameSubmissionDate}-year`]
	};
	const formattedDate = dayMonthYearHourMinuteToDisplayDate(submissionDate);

	const responses = {
		'Case type': {
			value: caseType,
			actions: {
				Change: {
					href: editLink(baseUrl, 'select-case-type'),
					visuallyHiddenText: 'case type'
				}
			}
		},
		'Date submitted': {
			value: formattedDate,
			actions: {
				Change: {
					href: editLink(baseUrl, 'submission-date'),
					visuallyHiddenText: 'date submitted'
				}
			}
		}
	};

	return checkYourAnswersComponent({
		title: 'Check details and create a new case',
		heading: 'Check details and create a new case',
		preHeading: 'Create a case',
		backLinkUrl: `${baseUrl}/submission-date`,
		submitButtonText: 'Create case',
		responses
	});
}
