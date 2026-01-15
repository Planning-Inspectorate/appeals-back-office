import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateInput } from '#lib/mappers/components/page-components/date.js';
import { yesNoInput } from '#lib/mappers/components/page-components/radio.js';
import { timeInput } from '#lib/mappers/components/page-components/time.js';
import { addressInputs } from '#lib/mappers/index.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

import { addressToString } from '#lib/address-formatter.js';
import {
	dateISOStringToDisplayDate,
	dateISOStringToDisplayTime12hr,
	dayMonthYearHourMinuteToISOString
} from '#lib/dates.js';
import { editLink } from '#lib/edit-utilities.js';
import { detailsComponent } from '#lib/mappers/components/page-components/details.js';
import { simpleHtmlComponent, textSummaryListItem } from '#lib/mappers/index.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { capitalize, pick } from 'lodash-es';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appealData
 * @param {{ day?: string | number, month?: string | number, year?: string | number, hour?: string | number, minute?: string | number }} values
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export function inquiryDatePage(appealData, values, backLinkUrl) {
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
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - ${
			appealData.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY
				? 'set up inquiry'
				: 'start case'
		}`,
		heading: 'Inquiry date and time',
		pageComponents: [dateComponent, timeComponent]
	};
}

/**
 * @param {Appeal} appealData
 * @param {string} action
 * @param {string} backLinkUrl
 * @param {Record<string, string>} [values]
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {{backLinkUrl: string, title: string, pageComponents: {type: string, parameters: {name: string, fieldset: {legend: {classes: string, text: string, isPageHeading: boolean}}, idPrefix: string, items: [{conditional: {html: string}, text: string, value: string},{text: string, value: string}]}}[], preHeading: string}}
 */
export function inquiryEstimationPage(appealData, action, backLinkUrl, errors, values) {
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
					checked: values?.inquiryEstimationYesNo === 'yes',
					conditional: {
						html: renderPageComponentsToHtml([
							{
								type: 'input',
								parameters: {
									id: 'inquiry-estimation-days',
									name: 'inquiryEstimationDays',
									value: values?.inquiryEstimationDays,
									...(errors && { errorMessage: { text: errors.msg } }),
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
					text: 'No',
					checked: values?.inquiryEstimationYesNo === 'no'
				}
			]
		}
	};

	/** @type {PageContent} */
	return {
		title: `Appeal - ${shortAppealReference} ${action === 'setup' ? 'start' : 'update'} case`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - ${
			action === 'setup' ? 'set up' : 'change'
		} inquiry`,
		// @ts-ignore
		pageComponents: [inquiryEstimationComponent, errors]
	};
}

/**
 * @param {Appeal} appealData
 * @param {string} backLinkUrl
 * @param {Record<string, string>} [values]
 * @returns {PageContent}
 */
export function addressKnownPage(appealData, backLinkUrl, values) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const addressKnownComponent = yesNoInput({
		name: 'addressKnown',
		id: 'address-known',
		legendText: 'Do you know the address of where the inquiry will take place?',
		legendIsPageHeading: true,
		value: values?.addressKnown ?? ''
	});

	/** @type {PageContent} */
	return {
		title: `Address - ${
			appealData.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY
				? 'set up inquiry'
				: 'start case'
		} - ${shortAppealReference}`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - ${
			appealData.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY
				? 'set up inquiry'
				: 'start case'
		}`,
		pageComponents: [addressKnownComponent]
	};
}

/**
 * @param {Appeal} appealData
 * @param {string} backLinkUrl
 * @param {Record<string, string>} values
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function addressDetailsPage(appealData, backLinkUrl, values = {}, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	return {
		title: `Address - ${
			appealData.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY
				? 'set up inquiry'
				: 'start case'
		} - ${shortAppealReference}`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Inquiry address',
		pageComponents: addressInputs({ address: values, errors })
	};
}

/**
 * @param {Appeal} appealDetails
 * @param {Record<string, string>} sessionValues
 * @param {string} backLinkUrl
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse | undefined} appellantCase
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns Promise<PageContent>
 */
export const inquiryDueDatesPage = async (
	appealDetails,
	sessionValues,
	backLinkUrl,
	appellantCase,
	errors = undefined
) => {
	/**
	 * @type {{backLinkUrl: string, heading: string, title: string, preHeading: string, pageComponents?: PageComponent[]}}
	 */
	let pageContent = {
		title: `Timetable due dates`,
		backLinkUrl,
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
		'proofOfEvidenceAndWitnessesDueDate'
	];

	if (appellantCase?.planningObligation?.hasObligation) {
		dueDateFields.push('planningObligationDueDate');
	}

	pageContent.pageComponents = dueDateFields.map((dateField) => {
		const fieldType = getDueDateFieldNameAndID(dateField);
		if (fieldType === undefined) {
			throw new Error(`Unknown date field: ${dateField}`);
		}
		const day = fieldType.id + '-day';
		const month = fieldType.id + '-month';
		const year = fieldType.id + '-year';
		return dateInput({
			name: `${fieldType.id}`,
			id: `${fieldType.id}`,
			namePrefix: `${fieldType.id}`,
			legendText: `${fieldType.name}`,
			hint: 'For example, 31 3 2025',
			legendClasses: 'govuk-fieldset__legend--m',
			value: {
				day: sessionValues[day] ? sessionValues[day] : '',
				month: sessionValues[month] ? sessionValues[month] : '',
				year: sessionValues[year] ? sessionValues[year] : ''
			},
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

/**
 * @param {string|number} appealId
 * @param {string} appealReference
 * @param {boolean} hasObligation
 * @param {'setup'|'change'} action
 * @param {import('@pins/express').Session} session
 * @param {string} procedureType
 * @param {string} appellantEmailPreview
 * @param {string} lpaEmailPreview
 * @returns {PageContent}
 */
export function confirmInquiryPage(
	appealId,
	appealReference,
	hasObligation,
	action,
	session,
	procedureType,
	appellantEmailPreview,
	lpaEmailPreview
) {
	/**@type {PageComponent[]} */
	const pageComponents = [];

	if (procedureType !== APPEAL_CASE_PROCEDURE.INQUIRY) {
		pageComponents.push({
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'appeal-procedure',
						text: 'Appeal procedure',
						value: capitalizeFirstLetter(APPEAL_CASE_PROCEDURE.INQUIRY),
						link: `/appeals-service/appeal-details/${appealId}/start-case/select-procedure`,
						editable: true
					})?.display.summaryListItem
				]
			}
		});
	}

	pageComponents.push(...mapInquiryDetails(appealId, action, session['setUpInquiry']?.[appealId]));

	if (procedureType !== APPEAL_CASE_PROCEDURE.INQUIRY) {
		pageComponents.push(
			...mapInquiryTimetableDue(
				appealId,
				action,
				hasObligation,
				session['setUpInquiry']?.[appealId]
			)
		);

		// Add page footer
		pageComponents.push(
			simpleHtmlComponent(
				'p',
				{
					class: 'govuk-body'
				},
				`We'll start the timetable now and send emails to the relevant parties.`
			),
			detailsComponent({
				summaryText: `Preview email to appellant`,
				html: appellantEmailPreview
			}),
			detailsComponent({
				summaryText: `Preview email to LPA`,
				html: lpaEmailPreview
			})
		);
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Check details and ${
			procedureType === APPEAL_CASE_PROCEDURE.INQUIRY ? 'set up inquiry' : 'start case'
		}`,
		backLinkUrl:
			procedureType === APPEAL_CASE_PROCEDURE.INQUIRY
				? `/appeals-service/appeal-details/${appealId}/inquiry/${action}/address-details`
				: `/appeals-service/appeal-details/${appealId}/inquiry/${action}/timetable-due-dates`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: `Check details and ${
			procedureType === APPEAL_CASE_PROCEDURE.INQUIRY ? 'set up inquiry' : 'start case'
		}`,
		pageComponents,
		submitButtonText: `${
			procedureType === APPEAL_CASE_PROCEDURE.INQUIRY ? 'Set up inquiry' : 'Start case'
		}`
	};

	return pageContent;
}

/**
 * @param {string|number} appealId
 * @param {string} appealReference
 * @param {'setup'|'change'} action
 * @param {import('@pins/express').Session} session
 * @returns {PageContent}
 */
export function confirmChangeInquiryPage(appealId, appealReference, action, session) {
	/**@type {PageComponent[]} */
	const pageComponents = [
		...mapInquiryDetails(appealId, action, session.changeInquiry),
		simpleHtmlComponent(
			'p',
			{
				class: 'govuk-body'
			},
			`We'll send an email to the appellant and LPA to tell them about the inquiry.`
		)
	];
	const inquiry = action === 'setup' ? session['setUpInquiry']?.[appealId] : session.changeInquiry;

	/** @type {PageContent} */
	const pageContent = {
		title: 'Check details and update inquiry',
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/inquiry/${action}/${
			inquiry.addressKnown === 'no' ? 'address' : 'address-details'
		}`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Check details and update inquiry',
		pageComponents,
		submitButtonText: 'Update inquiry'
	};

	return pageContent;
}

/**
 * @param {string|number} appealId
 * @param {string} action
 * @param {any} values
 * @returns {PageComponent[]}
 */
export function mapInquiryDetails(appealId, action, values) {
	const dateTime = dayMonthYearHourMinuteToISOString({
		day: values['inquiry-date-day'],
		month: values['inquiry-date-month'],
		year: values['inquiry-date-year'],
		hour: values['inquiry-time-hour'],
		minute: values['inquiry-time-minute']
	});
	const date = dateISOStringToDisplayDate(dateTime);
	const time = dateISOStringToDisplayTime12hr(dateTime);
	const address = pick(values, ['addressLine1', 'addressLine2', 'town', 'county', 'postCode']);

	/**@type {PageComponent[]} */
	const pageComponents = [
		simpleHtmlComponent(
			'h3',
			{
				class: 'govuk-heading-m'
			},
			`Inquiry details`
		),
		{
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'inquiry-date',
						text: 'Inquiry date',
						value: date,
						link: editLink(`/appeals-service/appeal-details/${appealId}/inquiry/${action}/date`),
						editable: true
					})?.display.summaryListItem
				]
			}
		},
		{
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'inquiry-time',
						text: 'Inquiry time',
						value: time,
						link: editLink(`/appeals-service/appeal-details/${appealId}/inquiry/${action}/date`),
						editable: true
					})?.display.summaryListItem
				]
			}
		},
		{
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'inquiry-expected-number-of-days',
						text: 'Do you know the expected number of days to carry out the inquiry?',
						value: capitalize(values.inquiryEstimationYesNo),
						link: editLink(
							`/appeals-service/appeal-details/${appealId}/inquiry/${action}/estimation`
						),
						editable: true
					})?.display.summaryListItem
				]
			}
		}
	];

	if (values.inquiryEstimationYesNo === 'yes') {
		pageComponents.push({
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'expected-number-of-days',
						text: 'Expected number of days to carry out the inquiry',
						value: `${values.inquiryEstimationDays} days`,
						link: editLink(
							`/appeals-service/appeal-details/${appealId}/inquiry/${action}/estimation`
						),
						editable: true
					})?.display.summaryListItem
				]
			}
		});
	}

	pageComponents.push({
		type: 'summary-list',
		parameters: {
			rows: [
				textSummaryListItem({
					id: 'inquiry-address-known',
					text: 'Do you know the address of where the inquiry will take place?',
					value: capitalize(values.addressKnown),
					link: editLink(`/appeals-service/appeal-details/${appealId}/inquiry/${action}/address`),
					editable: true
				})?.display.summaryListItem
			]
		}
	});

	if (values.addressKnown === 'yes' && address) {
		pageComponents.push({
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'inquiry-address',
						text: 'Address of where the inquiry will take place',
						value: { html: addressToString(address, '<br>') },
						link: editLink(
							`/appeals-service/appeal-details/${appealId}/inquiry/${action}/address-details`
						),
						editable: true
					})?.display.summaryListItem
				]
			}
		});
	}
	return pageComponents;
}

/**
 * @param {string|number} appealId
 * @param {string} action
 * @param {boolean} hasObligation
 * @param {any} values
 * @returns {PageComponent[]}
 */
export function mapInquiryTimetableDue(appealId, action, hasObligation, values) {
	/**@type {PageComponent[]} */
	const pageComponents = [
		simpleHtmlComponent(
			'h3',
			{
				class: 'govuk-heading-m'
			},
			`Timetable due dates`
		),
		{
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'lpa-questionnaire-due',
						text: 'LPA questionnaire due',
						value: dateISOStringToDisplayDate(
							dayMonthYearHourMinuteToISOString({
								day: values['lpa-questionnaire-due-date-day'],
								month: values['lpa-questionnaire-due-date-month'],
								year: values['lpa-questionnaire-due-date-year']
							})
						),
						link: `/appeals-service/appeal-details/${appealId}/inquiry/${action}/timetable-due-dates`,
						editable: true
					})?.display.summaryListItem
				]
			}
		},
		{
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'statement-due',
						text: 'Statement due',
						value: dateISOStringToDisplayDate(
							dayMonthYearHourMinuteToISOString({
								day: values['statement-due-date-day'],
								month: values['statement-due-date-month'],
								year: values['statement-due-date-year']
							})
						),
						link: `/appeals-service/appeal-details/${appealId}/inquiry/${action}/timetable-due-dates`,
						editable: true
					})?.display.summaryListItem
				]
			}
		},
		{
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'interested-party-comments-due',
						text: 'Interested party comments due',
						value: dateISOStringToDisplayDate(
							dayMonthYearHourMinuteToISOString({
								day: values['ip-comments-due-date-day'],
								month: values['ip-comments-due-date-month'],
								year: values['ip-comments-due-date-year']
							})
						),
						link: `/appeals-service/appeal-details/${appealId}/inquiry/${action}/timetable-due-dates`,
						editable: true
					})?.display.summaryListItem
				]
			}
		},
		{
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'statement-of-common-ground-due',
						text: 'Statement of common ground due',
						value: dateISOStringToDisplayDate(
							dayMonthYearHourMinuteToISOString({
								day: values['statement-of-common-ground-due-date-day'],
								month: values['statement-of-common-ground-due-date-month'],
								year: values['statement-of-common-ground-due-date-year']
							})
						),
						link: `/appeals-service/appeal-details/${appealId}/inquiry/${action}/timetable-due-dates`,
						editable: true
					})?.display.summaryListItem
				]
			}
		},
		{
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'proof-of-evidence-and-witnesses-due',
						text: 'Proof of evidence and witnesses due',
						value: dateISOStringToDisplayDate(
							dayMonthYearHourMinuteToISOString({
								day: values['proof-of-evidence-and-witnesses-due-date-day'],
								month: values['proof-of-evidence-and-witnesses-due-date-month'],
								year: values['proof-of-evidence-and-witnesses-due-date-year']
							})
						),
						link: `/appeals-service/appeal-details/${appealId}/inquiry/${action}/timetable-due-dates`,
						editable: true
					})?.display.summaryListItem
				]
			}
		}
	];

	if (hasObligation) {
		pageComponents.push({
			type: 'summary-list',
			parameters: {
				rows: [
					textSummaryListItem({
						id: 'planning-obligation-due',
						text: 'Planning obligation due',
						value: dateISOStringToDisplayDate(
							dayMonthYearHourMinuteToISOString({
								day: values['planning-obligation-due-date-day'],
								month: values['planning-obligation-due-date-month'],
								year: values['planning-obligation-due-date-year']
							})
						),
						link: `/appeals-service/appeal-details/${appealId}/inquiry/${action}/timetable-due-dates`,
						editable: true
					})?.display.summaryListItem
				]
			}
		});
	}

	return pageComponents;
}
