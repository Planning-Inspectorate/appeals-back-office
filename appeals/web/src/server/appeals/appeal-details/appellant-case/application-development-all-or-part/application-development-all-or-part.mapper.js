/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';

const APPLICATION_DEVELOPMENT_ALL = 'All';
const APPLICATION_DEVELOPMENT_PART = 'Part';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @returns {PageContent}
 */
export const changeApplicationDevelopmentAllOrPartPage = (appealData, appellantCaseData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const { applicationDevelopmentAllOrPart } = appellantCaseData?.enforcementNotice ?? {};

	const isAllOfTheDevelopment = applicationDevelopmentAllOrPart === APPLICATION_DEVELOPMENT_ALL;
	const isPartOfTheDevelopment = applicationDevelopmentAllOrPart === APPLICATION_DEVELOPMENT_PART;

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
							value: APPLICATION_DEVELOPMENT_ALL,
							text: 'All of the development',
							checked: isAllOfTheDevelopment
						},
						{
							value: APPLICATION_DEVELOPMENT_PART,
							text: 'Part of the development',
							checked: isPartOfTheDevelopment
						}
					]
				}
			}
		]
	};

	return pageContent;
};
