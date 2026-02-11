/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} LPAQuestionnaire
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { toSentenceCase } from '#lib/string-utilities.js';
import { APPEAL_APPLICATION_MADE_UNDER_ACT_SECTION } from '@planning-inspectorate/data-model';

/**
 * @param {Appeal} appealData
 * @param {LPAQuestionnaire} lpaQuestionnaireData
 * @param {string} storedSessionData
 * @returns {PageContent}
 */
export const changeAppealUnderActSectionPage = (
	appealData,
	lpaQuestionnaireData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const appealUnderActSection =
		storedSessionData ?? lpaQuestionnaireData?.appealUnderActSection ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: `What type of lawful development certificate is the appeal about?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'appealUnderActSection',
					idPrefix: 'appeal-under-act-section',
					fieldset: {
						legend: {
							text: 'What type of lawful development certificate is the appeal about?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: Object.values(APPEAL_APPLICATION_MADE_UNDER_ACT_SECTION).map(
						(appealUnderActSectionOption) => ({
							value: appealUnderActSectionOption,
							text: toSentenceCase(appealUnderActSectionOption),
							checked: appealUnderActSectionOption === appealUnderActSection
						})
					)
				}
			}
		]
	};

	return pageContent;
};
