/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { APPEAL_KNOWS_OTHER_OWNERS } from 'pins-data-model';

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
		title: `Change owners known`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change owners known`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'ownersKnownRadio',
					id: 'owners-known-radio',
					fieldSet: {
						legend: {
							text: `Does the appellant know the other landowners?`,
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: APPEAL_KNOWS_OTHER_OWNERS.NO,
							text: 'No',
							checked: knowsOtherLandowners === APPEAL_KNOWS_OTHER_OWNERS.NO
						},
						{
							value: APPEAL_KNOWS_OTHER_OWNERS.YES,
							text: 'Yes',
							checked: knowsOtherLandowners === APPEAL_KNOWS_OTHER_OWNERS.YES
						},
						{
							value: APPEAL_KNOWS_OTHER_OWNERS.SOME,
							text: 'Some',
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
