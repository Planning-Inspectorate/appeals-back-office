/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{radio: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeProcedurePreferencePage = (appealData, appellantCaseData, storedSessionData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let procedurePreference = appellantCaseData.appellantProcedurePreference?.toLowerCase();

	if (storedSessionData?.radio) {
		procedurePreference = storedSessionData.radio;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `How would you prefer us to decide your appeal?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'procedurePreferenceRadio',
					idPrefix: 'procedure-preference-radio',
					fieldset: {
						legend: {
							text: 'How would you prefer us to decide your appeal?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'written',
							text: 'Written representations',
							checked: procedurePreference === APPEAL_CASE_PROCEDURE.WRITTEN
						},
						{
							value: 'hearing',
							text: 'Hearing',
							checked: procedurePreference === APPEAL_CASE_PROCEDURE.HEARING
						},
						{
							value: 'inquiry',
							text: 'Inquiry',
							checked: procedurePreference === APPEAL_CASE_PROCEDURE.INQUIRY
						}
					]
				}
			}
		]
	};

	return pageContent;
};

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{textarea: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeProcedurePreferenceDetailsPage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let procedurePreferenceDetails = appellantCaseData.appellantProcedurePreferenceDetails;

	if (storedSessionData?.textarea) {
		procedurePreferenceDetails = storedSessionData.textarea;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Why would you prefer this appeal procedure?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'textarea',
				parameters: {
					name: 'procedurePreferenceDetailsTextarea',
					id: 'procedure-preference-details-textarea',
					label: {
						text: 'Why would you prefer this appeal procedure?',
						classes: 'govuk-label--l',
						isPageHeading: true
					},
					value: procedurePreferenceDetails || ''
				}
			}
		]
	};

	return pageContent;
};

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{input: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeProcedurePreferenceDurationPage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let procedurePreferenceDuration =
		appellantCaseData.appellantProcedurePreferenceDuration?.toString();

	if (storedSessionData?.input) {
		procedurePreferenceDuration = storedSessionData.input;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `How many days would you expect the inquiry to last?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'input',
				parameters: {
					name: 'procedurePreferenceDurationInput',
					id: 'procedure-preference-duration',
					label: {
						text: 'How many days would you expect the inquiry to last?',
						classes: 'govuk-label--l',
						isPageHeading: true
					},
					classes: 'govuk-input--width-2',
					value: procedurePreferenceDuration ?? 'Not answered'
				}
			}
		]
	};

	return pageContent;
};

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{input: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeInquiryNumberOfWitnessesPage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let inquiryNumberOfWitnesses =
		appellantCaseData.appellantProcedurePreferenceWitnessCount?.toString();

	if (storedSessionData?.input) {
		inquiryNumberOfWitnesses = storedSessionData.input;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `How many witnesses would you expect to give evidence at the inquiry?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'input',
				parameters: {
					name: 'inquiryNumberOfWitnessesInput',
					id: 'inquiry-number-of-witnesses',
					label: {
						text: 'How many witnesses would you expect to give evidence at the inquiry?',
						classes: 'govuk-label--l',
						isPageHeading: true
					},
					classes: 'govuk-input--width-2',
					value: inquiryNumberOfWitnesses || 'Not answered'
				}
			}
		]
	};

	return pageContent;
};
