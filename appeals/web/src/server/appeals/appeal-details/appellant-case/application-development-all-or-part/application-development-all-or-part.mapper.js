/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { toSentenceCase } from '#lib/string-utilities.js';

const ALL_OF_THE_DEVELOPMENT = 'all-of-the-development';
const PART_OF_THE_DEVELOPMENT = 'part-of-the-development';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @returns {PageContent}
 */
export const changeApplicationDevelopmentAllOrPartPage = (appealData, appellantCaseData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const { applicationDevelopmentAllOrPart } = appellantCaseData?.enforcementNotice ?? {};

	/** @type {PageContent} */
	const pageContent = {
		title: `Does the appellant own all of the land involved in the appeal?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'applicationDevelopmentAllOrPartRadio',
					idPrefix: 'application-development-all-or-part-radio',
					fieldset: {
						legend: {
							text: 'Was the application for all or part of the development?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: ALL_OF_THE_DEVELOPMENT,
							text: toSentenceCase(ALL_OF_THE_DEVELOPMENT),
							checked: applicationDevelopmentAllOrPart === ALL_OF_THE_DEVELOPMENT
						},
						{
							value: PART_OF_THE_DEVELOPMENT,
							text: toSentenceCase(PART_OF_THE_DEVELOPMENT),
							checked: applicationDevelopmentAllOrPart === PART_OF_THE_DEVELOPMENT
						}
					]
				}
			}
		]
	};

	return pageContent;
};
