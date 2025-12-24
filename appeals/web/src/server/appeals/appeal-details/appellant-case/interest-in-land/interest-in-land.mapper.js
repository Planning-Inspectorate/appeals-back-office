/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { INTEREST_IN_LAND } from '#lib/constants.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { toSentenceCase } from '#lib/string-utilities.js';

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
	const interestInLand = errors?.interestInLandOther
		? errors?.interestInLandOther.value
		: appealData.enforcementNotice?.appellantCase?.interestInLand;
	const interestInLandOtherChecked =
		typeof interestInLand === 'string' && !INTEREST_IN_LAND.includes(interestInLand);

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
						...INTEREST_IN_LAND.map((interestInLandOption) => ({
							value: interestInLandOption,
							text: toSentenceCase(interestInLandOption),
							checked: interestInLandOption === interestInLand
						})),
						{
							value: 'other',
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
