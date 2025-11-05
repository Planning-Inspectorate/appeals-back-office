import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {import('../../appeal-details.types.js').WebAppeal} appealData
 * @param {string|null} existingValue
 * @param {string|undefined} [sessionRadioValue]
 * @param {string|undefined} [sessionDetailsValue]
 * @returns {PageContent}
 */
export function changeNeighbouringSiteAccessPage(
	appealData,
	existingValue,
	sessionRadioValue,
	sessionDetailsValue
) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Will the inspector need to enter a neighbour’s land or property?',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Will the inspector need to enter a neighbour’s land or property?',
		pageComponents: [
			yesNoInput({
				name: 'neighbouringSiteAccessRadio',
				value: sessionRadioValue === 'yes' || !!existingValue,
				yesConditional: {
					id: 'neighbouring-site-access-details',
					name: 'neighbouringSiteAccess',
					hint: 'Enter the reason',
					details: sessionDetailsValue || existingValue || ''
				}
			})
		]
	};

	return pageContent;
}
