/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { conditionalFormatter } from '#lib/mappers/global-mapper-formatter.js';

/**
 * @param {Appeal} appealData
 * @param {{radio: string, details: string}} storedSessionData
 * @param {string} origin
 * @param {string} source
 * @returns {PageContent}
 */
export const changeInspectorAccessPage = (appealData, storedSessionData, origin, source) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const sourceKey = source === 'lpa' ? 'lpaQuestionnaire' : 'appellantCase';
	const formattedSource = source === 'lpa' ? 'LPA' : source;

	const currentRadioValue =
		storedSessionData?.radio ?? appealData.inspectorAccess[sourceKey].isRequired ?? '';
	const currentDetailsValue =
		storedSessionData?.details ?? appealData.inspectorAccess[sourceKey].details ?? '';

	/** @type {PageContent} */
	const pageContent = {
		title: `Change the inspector access (${formattedSource} answer)`,
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change the inspector access (${formattedSource} answer)`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'inspectorAccessRadio',
					id: 'inspector-access-radio',
					fieldSet: {
						legend: {
							text: `Was inspector access identified as required by the ${formattedSource}?`,
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'yes',
							text: 'Yes',
							conditional: conditionalFormatter(
								'inspector-access-details',
								'inspectorAccessDetails',
								`Inspector access (${formattedSource} details)`,
								currentDetailsValue
							),
							checked: currentRadioValue
						},
						{
							value: 'no',
							text: 'No',
							checked: !currentRadioValue
						}
					]
				}
			}
		]
	};
	return pageContent;
};
