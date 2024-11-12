import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/index.js';
import { APPEAL_EIA_DEVELOPMENT_DESCRIPTION } from 'pins-data-model';
import { snakeCaseToSpaceSeparated, capitalizeFirstLetter } from '#lib/string-utilities.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../lpa-questionnaire.service.js').LpaQuestionnaire} LpaQuestionnaire
 */

/**
 * @param {Appeal} appealData
 * @param {string|null} [existingValue]
 */
export function changeEiaDevelopmentDescriptionPage(appealData, existingValue) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Change description of development`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change description of development`,
		headingClasses: 'govuk-heading-l',
		pageComponents: [
			radiosInput({
				name: 'eiaDevelopmentDescription',
				items: Object.values(APPEAL_EIA_DEVELOPMENT_DESCRIPTION).map((description) => ({
					text: capitalizeFirstLetter(snakeCaseToSpaceSeparated(description)),
					value: description
				})),
				value: existingValue
			})
		]
	};

	return pageContent;
}
