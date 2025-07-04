import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateInput } from '#lib/mappers/components/page-components/date.js';
import { timeInput } from '#lib/mappers/components/page-components/time.js';
import { addressInputs } from '#lib/mappers/index.js';
import { yesNoInput } from '#lib/mappers/components/page-components/radio.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appealData
 * @param {{ day?: string | number, month?: string | number, year?: string | number, hour?: string | number, minute?: string | number }} values
 * @returns {PageContent}
 */
export function inquiryDatePage(appealData, values) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const date = { day: values.day || '', month: values.month || '', year: values.year || '' };
	const time =
		String(values.hour) || String(values.minute)
			? { hour: String(values.hour) || '', minute: String(values.minute).padStart(2, '0') || '' }
			: { hour: '10', minute: '00' };

	const dateComponent = dateInput({
		name: 'inquiry-date',
		id: 'inquiry-date',
		namePrefix: 'inquiry-date',
		legendText: 'Date',
		legendClasses: 'govuk-fieldset__legend--m',
		hint: 'For example, 31 3 2025',
		value: date
	});

	const timeComponent = timeInput({
		id: 'inquiry-time',
		hint: 'For example, 9:00 or 13:15',
		value: { hour: time?.hour, minute: time?.minute },
		legendText: 'Time',
		legendClasses: 'govuk-fieldset__legend--m',
		showLabels: true
	});

	/** @type {PageContent} */
	return {
		title: `Date and time - set up inquiry - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/start-case/select-procedure`,
		preHeading: `Appeal ${shortAppealReference} - start case`,
		heading: 'Inquiry date and time',
		pageComponents: [dateComponent, timeComponent]
	};
}

/**
 * @param {Appeal} appealData
 * @param {string} action
 * @returns {{backLinkUrl: string, title: string, pageComponents: {type: string, parameters: {name: string, fieldset: {legend: {classes: string, text: string, isPageHeading: boolean}}, idPrefix: string, items: [{conditional: {html: string}, text: string, value: string},{text: string, value: string}]}}[], preHeading: string}}
 */
export function inquiryEstimationPage(appealData, action) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const inquiryEstimationComponent = {
		type: 'radios',
		parameters: {
			idPrefix: 'inquiry-estimation-yes-no',
			name: 'inquiryEstimationYesNo',
			fieldset: {
				legend: {
					text: 'Do you know the expected number of days to carry out the inquiry?',
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			items: [
				{
					value: 'yes',
					text: 'Yes',
					conditional: {
						html: renderPageComponentsToHtml([
							{
								type: 'input',
								parameters: {
									id: 'inquiry-estimation-days',
									name: 'inquiryEstimationDays',
									label: {
										text: 'Expected number of days to carry out the inquiry',
										classes: 'govuk-label--s'
									},
									suffix: {
										text: 'Days'
									},
									classes: 'govuk-input--width-3'
								}
							}
						])
					}
				},
				{
					value: 'no',
					text: 'No'
				}
			]
		}
	};

	/** @type {PageContent} */
	return {
		title: `Appeal - ${shortAppealReference} start case`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/inquiry/${action}/date`,
		preHeading: `Appeal ${shortAppealReference} - set up inquiry`,
		// @ts-ignore
		pageComponents: [inquiryEstimationComponent]
	};
}

/**
 * @param {Appeal} appealData
 * @param {string} action
 * @param {{ addressKnown: string }} [values]
 * @returns {PageContent}
 */
export function addressKnownPage(appealData, action, values) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const addressKnownComponent = yesNoInput({
		name: 'addressKnown',
		id: 'address-known',
		legendText: 'Do you know the address of where the inquiry will take place?',
		legendIsPageHeading: true,
		value: values?.addressKnown
	});

	/** @type {PageContent} */
	return {
		title: `Address - start case - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/inquiry/${action}/date`,
		preHeading: `Appeal ${shortAppealReference} - start case`,
		pageComponents: [addressKnownComponent]
	};
}

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals').Address} currentAddress
 * @param {'setup' | 'change'} action
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function addressDetailsPage(appealData, action, currentAddress, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	return {
		title: `Address - start case - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/inquiry/${action}/address`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Inquiry address',
		pageComponents: addressInputs({ address: currentAddress, errors })
	};
}

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/appeals').Address} values
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns Promise<PageContent>
 */
export const inquiryDueDatesPage = async (appealDetails, values, errors = undefined) => {
	/**
	 * @type {{backLinkUrl: string, heading: string, title: string, preHeading: string, pageComponents?: PageComponent[]}}
	 */
	let pageContent = {
		title: `Timetable due dates`,
		backLinkUrl:
			values.addressLine1 || values.addressLine2
				? `/appeals-service/appeal-details/${appealDetails.appealId}/inquiry/setup/address-details`
				: `/appeals-service/appeal-details/${appealDetails.appealId}/inquiry/setup/address`,
		preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
		heading: `Timetable due dates`,
		pageComponents: []
	};
	/**
	 *
	 * @type {string[]}
	 */
	const dueDateFields = [
		'lpaQuestionnaireDueDate',
		'statementDueDate',
		'ipCommentsDueDate',
		'statementOfCommonGroundDueDate',
		'proofOfEvidenceAndWitnessesDueDate',
		'planningObligationDueDate'
	];

	pageContent.pageComponents = dueDateFields.map((dateField) => {
		const fieldType = getDueDateFieldNameAndID(dateField);
		if (fieldType === undefined) {
			throw new Error(`Unknown date field: ${dateField}`);
		}
		return dateInput({
			name: `${fieldType.id}`,
			id: `${fieldType.id}`,
			namePrefix: `${fieldType.id}`,
			legendText: `${fieldType.name}`,
			hint: 'For example, 31 3 2025',
			legendClasses: 'govuk-fieldset__legend--m',
			errors: errors
		});
	});

	return pageContent;
};

/**
 *
 * @param {string} dateField
 * @returns {undefined | {name: string, id: string}}
 */
export const getDueDateFieldNameAndID = (dateField) => {
	switch (dateField) {
		case 'lpaQuestionnaireDueDate':
			return {
				id: 'lpa-questionnaire-due-date',
				name: 'LPA questionnaire due date'
			};
		case 'statementDueDate':
			return {
				id: 'statement-due-date',
				name: 'Statement due date'
			};
		case 'ipCommentsDueDate':
			return {
				id: 'ip-comments-due-date',
				name: 'Interested party comments'
			};
		case 'statementOfCommonGroundDueDate':
			return {
				id: 'statement-of-common-ground-due-date',
				name: 'Statement of common ground due date'
			};
		case 'proofOfEvidenceAndWitnessesDueDate':
			return {
				id: 'proof-of-evidence-and-witnesses-due-date',
				name: 'Proof of evidence and witnesses due date'
			};
		case 'planningObligationDueDate':
			return {
				id: 'planning-obligation-due-date',
				name: 'Planning obligation due date'
			};
		default:
			return undefined;
	}
};
