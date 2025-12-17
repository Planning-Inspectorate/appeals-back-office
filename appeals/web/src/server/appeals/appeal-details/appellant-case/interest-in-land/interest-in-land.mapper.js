/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @param {Appeal} appealData
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export const manageInterestInLandPage = (appealData, errors) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const interestInLand = appealData.enforcementNotice?.appellantCase?.interestInLand;
	const interestInLandOtherChecked =
		!!interestInLand && !['Owner', 'Mortgage Lender', 'Tenant'].includes(interestInLand);

	/** @type {PageContent} */
	const pageContent = {
		title: `What is your interest in the land?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'interestInLandRadio',
					idPrefix: 'interest-in-land-radio',
					fieldset: {
						legend: {
							text: 'What is your interest in the land?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'Owner',
							text: 'Owner',
							checked: interestInLand === 'Owner'
						},
						{
							value: 'Mortgage Lender',
							text: 'Mortgage lender',
							checked: interestInLand === 'Mortgage Lender'
						},
						{
							value: 'Tenant',
							text: 'Tenant',
							checked: interestInLand === 'Tenant'
						},
						{
							value: 'Other',
							text: 'Other',
							checked: interestInLandOtherChecked,
							conditional: {
								html: renderPageComponentsToHtml([
									{
										type: 'input',
										parameters: {
											id: 'interest-in-land-other',
											name: 'interestInLandOther',
											value: interestInLandOtherChecked ? interestInLand : '',
											...(errors && { errorMessage: { text: errors.interestInLandOther?.msg } }),
											label: {
												text: 'Enter interest in the land',
												classes: 'govuk-label--s'
											}
										}
									}
								])
							}
						}
					]
				}
			}
		]
	};

	return pageContent;
};
