/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { APPEAL_DEVELOPMENT_TYPES } from '@pins/appeals/constants/appellant-cases.constants.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{ value?: string }} storedSessionData
 * @returns {PageContent}
 */
export const changeDevelopmentTypePage = (appealData, appellantCaseData, storedSessionData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const selectedValue = storedSessionData?.value || appellantCaseData?.developmentType || '';

	/** @type {PageContent} */
	const pageContent = {
		title: 'Development type',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'developmentType',
					fieldset: {
						legend: {
							text: 'Development type',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: APPEAL_DEVELOPMENT_TYPES.map(
						(/** @type {{value: string, label: string}} */ { value, label }) => ({
							value,
							text: capitalizeFirstLetter(label),
							checked: value === selectedValue
						})
					)
				}
			}
		]
	};

	return pageContent;
};
