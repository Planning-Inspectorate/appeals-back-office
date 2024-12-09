import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {import('../../appeal-details.types.js').WebAppeal} appealData
 * @param {string|null} existingValue
 * @returns {PageContent}
 */
export function changeNeighbouringSiteAccessPage(appealData, existingValue) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Change whether inspector needs neighbouring site access',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Change whether inspector needs neighbouring site access',
		pageComponents: [
			yesNoInput({
				name: 'neighbouringSiteAccessRadio',
				value: !!existingValue,
				yesConditional: {
					id: 'neighbouring-site-access-details',
					name: 'neighbouringSiteAccess',
					hint: 'Inspector needs neighbouring site access details',
					details: existingValue || ''
				}
			})
		]
	};

	return pageContent;
}
