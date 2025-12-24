/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * /**
 * @typedef {Object} SessionData
 * @property {string} [interestInLand]
 * @property {string} [interestInLandOtherText]
 *
 * @param {Appeal} appealData
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @param {SessionData} session
 * @returns {PageContent}
 */
export const manageInterestInLandPage = (appealData, errors, session) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const interestInLand =
		session.interestInLand || appealData.enforcementNotice?.appellantCase?.interestInLand;
	const interestInLandOtherChecked =
		!!interestInLand && !['Owner', 'Mortgage lender', 'Tenant'].includes(interestInLand);
	const interestInLandOtherText = session.interestInLand
		? session.interestInLandOtherText
		: interestInLandOtherChecked
		? appealData.enforcementNotice?.appellantCase?.interestInLand
		: '';

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
							value: 'Mortgage lender',
							text: 'Mortgage lender',
							checked: interestInLand === 'Mortgage lender'
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
											value: interestInLandOtherText,
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
