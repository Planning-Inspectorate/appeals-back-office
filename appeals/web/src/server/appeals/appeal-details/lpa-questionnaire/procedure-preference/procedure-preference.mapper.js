/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput, textareaInput, textInput } from '#lib/mappers/index.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} lpaQuestionnaireData
 * @param {{radio: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeProcedurePreferencePage = (
	appealData,
	lpaQuestionnaireData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let procedurePreference = lpaQuestionnaireData.lpaProcedurePreference?.toLowerCase();

	if (storedSessionData?.radio) {
		procedurePreference = storedSessionData.radio;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: 'Which procedure do you think is most appropriate for this appeal?',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${lpaQuestionnaireData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			radiosInput({
				name: 'procedurePreferenceRadio',
				legendText: 'Which procedure do you think is most appropriate for this appeal?',
				legendIsPageHeading: true,
				items: [
					{
						value: 'hearing',
						text: 'Hearing',
						checked: procedurePreference === APPEAL_CASE_PROCEDURE.HEARING
					},
					{
						value: 'inquiry',
						text: 'Inquiry',
						checked: procedurePreference === APPEAL_CASE_PROCEDURE.INQUIRY
					},
					{
						value: 'written',
						text: 'Written',
						checked: procedurePreference === APPEAL_CASE_PROCEDURE.WRITTEN
					}
				]
			})
		]
	};

	return pageContent;
};

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} lpaQuestionnaireData
 * @param {{textarea: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeProcedurePreferenceDetailsPage = (
	appealData,
	lpaQuestionnaireData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let procedurePreferenceDetails = lpaQuestionnaireData.lpaProcedurePreferenceDetails;

	if (storedSessionData?.textarea) {
		procedurePreferenceDetails = storedSessionData.textarea;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: 'Why would you prefer this procedure?',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${lpaQuestionnaireData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			textareaInput({
				name: 'procedurePreferenceDetailsTextarea',
				id: 'procedure-preference-details',
				labelText: 'Why would you prefer this procedure?',
				labelIsPageHeading: true,
				value: procedurePreferenceDetails || ''
			})
		]
	};

	return pageContent;
};

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} lpaQuestionnaireData
 * @param {{input: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeProcedurePreferenceDurationPage = (
	appealData,
	lpaQuestionnaireData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let procedurePreferenceDuration = lpaQuestionnaireData.lpaProcedurePreferenceDuration?.toString();

	if (storedSessionData?.input) {
		procedurePreferenceDuration = storedSessionData.input;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: 'How many days would you expect the inquiry to last?',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${lpaQuestionnaireData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'How many days would you expect the inquiry to last?',
		pageComponents: [
			textInput({
				name: 'procedurePreferenceDurationInput',
				id: 'procedure-preference-duration',
				classes: 'govuk-input--width-2',
				value: procedurePreferenceDuration || ''
			})
		]
	};

	return pageContent;
};
