import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/radio.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../lpa-questionnaire.service.js').LpaQuestionnaire} LpaQuestionnaire
 */

/**
 * @param {Appeal} appealData
 * @param {boolean|null} [existingValue]
 */
export function changeEiaColumnTwoThresholdPage(appealData, existingValue) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Change whether meets or exceeds column 2 threshold criteria`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change whether meets or exceeds column 2 threshold criteria`,
		headingClasses: 'govuk-heading-l',
		pageComponents: [
			yesNoInput({
				name: 'eiaColumnTwoThreshold',
				value: existingValue,
				customYesLabel: 'Meets or exceeds',
				customNoLabel: 'Does not meet or exceed'
			})
		]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {boolean|null} [existingValue]
 */
export function changeEiaRequiresEnvironmentalStatementPage(appealData, existingValue) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Change opinion that environmental statement needed`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change opinion that environmental statement needed`,
		headingClasses: 'govuk-heading-l',
		pageComponents: [
			yesNoInput({
				name: 'eiaRequiresEnvironmentalStatement',
				value: existingValue,
				customYesLabel: 'Needed',
				customNoLabel: 'Not needed'
			})
		]
	};

	return pageContent;
}
