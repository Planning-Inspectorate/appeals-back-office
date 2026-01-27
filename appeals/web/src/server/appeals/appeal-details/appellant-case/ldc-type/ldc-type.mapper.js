/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { toSentenceCase } from '#lib/string-utilities.js';
import { APPEAL_APPLICATION_MADE_UNDER_ACT_SECTION } from '@planning-inspectorate/data-model';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {string} storedSessionData
 * @returns {PageContent}
 */
export const changeApplicationMadeUnderActSectionPage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const applicationMadeUnderActSection =
		storedSessionData ?? appellantCaseData?.applicationMadeUnderActSection ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: `What type of lawful development certificate is the appeal about?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'applicationMadeUnderActSection',
					idPrefix: 'application-made-under-act-section',
					fieldset: {
						legend: {
							text: 'What type of lawful development certificate is the appeal about?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						...Object.values(APPEAL_APPLICATION_MADE_UNDER_ACT_SECTION).map(
							(applicationMadeUnderActSectionOption) => ({
								value: applicationMadeUnderActSectionOption,
								text: toSentenceCase(applicationMadeUnderActSectionOption),
								checked: applicationMadeUnderActSectionOption === applicationMadeUnderActSection
							})
						)
					]
				}
			}
		]
	};

	return pageContent;
};
