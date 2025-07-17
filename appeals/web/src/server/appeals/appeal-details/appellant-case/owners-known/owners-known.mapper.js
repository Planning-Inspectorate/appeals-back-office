/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { APPEAL_KNOWS_OTHER_OWNERS } from '@planning-inspectorate/data-model';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{radio: string, details: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeOwnersKnownPage = (appealData, appellantCaseData, storedSessionData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let knowsOtherLandowners = appellantCaseData.siteOwnership.knowsOtherLandowners;

	if (storedSessionData?.radio) {
		knowsOtherLandowners = storedSessionData.radio;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Does the appellant know who owns the land involved in the appeal?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'ownersKnownRadio',
					idPrefix: 'owners-known-radio',
					fieldset: {
						legend: {
							text: 'Does the appellant know who owns the land involved in the appeal?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: APPEAL_KNOWS_OTHER_OWNERS.YES,
							text: 'Yes',
							checked: knowsOtherLandowners === APPEAL_KNOWS_OTHER_OWNERS.YES
						},
						{
							value: APPEAL_KNOWS_OTHER_OWNERS.NO,
							text: 'No',
							checked: knowsOtherLandowners === APPEAL_KNOWS_OTHER_OWNERS.NO
						},
						{
							value: APPEAL_KNOWS_OTHER_OWNERS.SOME,
							text: 'Some of the land',
							checked: knowsOtherLandowners === APPEAL_KNOWS_OTHER_OWNERS.SOME
						},
						{
							value: 'not-applicable',
							text: 'Not applicable',
							checked: knowsOtherLandowners === null
						}
					]
				}
			}
		]
	};

	return pageContent;
};
