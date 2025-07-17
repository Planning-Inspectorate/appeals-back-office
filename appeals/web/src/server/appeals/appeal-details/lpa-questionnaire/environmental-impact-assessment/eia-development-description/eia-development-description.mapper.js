import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/index.js';
import { APPEAL_EIA_DEVELOPMENT_DESCRIPTION } from '@planning-inspectorate/data-model';

/**
 * @typedef {import('../../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../../lpa-questionnaire.service.js').LpaQuestionnaire} LpaQuestionnaire
 */

export const eiaDescriptions = {
	[APPEAL_EIA_DEVELOPMENT_DESCRIPTION.AGRICULTURE_AQUACULTURE]: 'Agriculture and aquaculture',
	[APPEAL_EIA_DEVELOPMENT_DESCRIPTION.CHANGE_EXTENSIONS]: 'Changes and extensions',
	[APPEAL_EIA_DEVELOPMENT_DESCRIPTION.CHEMICAL_INDUSTRY]:
		'Chemical industry (unless included in Schedule 1)',
	[APPEAL_EIA_DEVELOPMENT_DESCRIPTION.ENERGY_INDUSTRY]: 'Energy industry',
	[APPEAL_EIA_DEVELOPMENT_DESCRIPTION.EXTRACTIVE_INDUSTRY]: 'Extractive industry',
	[APPEAL_EIA_DEVELOPMENT_DESCRIPTION.FOOD_INDUSTRY]: 'Food industry',
	[APPEAL_EIA_DEVELOPMENT_DESCRIPTION.INFRASTRUCTURE_PROJECTS]: 'Infrastructure projects',
	[APPEAL_EIA_DEVELOPMENT_DESCRIPTION.MINERAL_INDUSTRY]: 'Mineral industry',
	[APPEAL_EIA_DEVELOPMENT_DESCRIPTION.OTHER_PROJECTS]: 'Other projects',
	[APPEAL_EIA_DEVELOPMENT_DESCRIPTION.PRODUCTION_PROCESSING_OF_METALS]:
		'Production and processing of metals',
	[APPEAL_EIA_DEVELOPMENT_DESCRIPTION.RUBBER_INDUSTRY]: 'Rubber industry',
	[APPEAL_EIA_DEVELOPMENT_DESCRIPTION.TEXTILE_INDUSTRIES]:
		'Textile, leather, wood and paper industries',
	[APPEAL_EIA_DEVELOPMENT_DESCRIPTION.TOURISM_LEISURE]: 'Tourism and leisure'
};

/**
 * @param {Appeal} appealData
 * @param {string|null} [existingValue]
 */
export function changeEiaDevelopmentDescriptionPage(appealData, existingValue) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Description of development',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			radiosInput({
				name: 'eiaDevelopmentDescription',
				legendText: 'Description of development',
				legendIsPageHeading: true,
				items: Object.values(APPEAL_EIA_DEVELOPMENT_DESCRIPTION).map((value) => ({
					text: eiaDescriptions[value],
					value
				})),
				value: existingValue
			})
		]
	};

	return pageContent;
}
