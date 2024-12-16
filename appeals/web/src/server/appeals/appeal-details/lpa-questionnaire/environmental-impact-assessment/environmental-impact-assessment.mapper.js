import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

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
		pageComponents: [
			yesNoInput({
				name: 'eiaColumnTwoThreshold',
				value: existingValue,
				legendText: 'Change whether meets or exceeds column 2 threshold criteria',
				legendIsPageHeading: true,
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
		pageComponents: [
			yesNoInput({
				name: 'eiaRequiresEnvironmentalStatement',
				value: existingValue,
				legendText: 'Change opinion that environmental statement needed',
				legendIsPageHeading: true,
				customYesLabel: 'Needed',
				customNoLabel: 'Not needed'
			})
		]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {string|null} existingValue
 * @param {string|undefined} [sessionRadioValue]
 * @param {string|undefined} [sessionDetailsValue]
 * @returns {PageContent}
 */
export function changeEiaSensitiveAreaDetailsPage(
	appealData,
	existingValue,
	sessionRadioValue,
	sessionDetailsValue
) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Change whether in, partly in, or likely to affect a sensitive area',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Change whether in, partly in, or likely to affect a sensitive area',
		pageComponents: [
			yesNoInput({
				name: 'eiaSensitiveAreaDetailsRadio',
				value: sessionRadioValue === 'yes' || !!existingValue,
				yesConditional: {
					id: 'eia-sensitive-area-details',
					name: 'eiaSensitiveAreaDetails',
					hint: 'In, partly in, or likely to affect a sensitive area details',
					details: sessionDetailsValue || existingValue || ''
				}
			})
		]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {string|null} existingValue
 * @param {string|undefined} [sessionRadioValue]
 * @param {string|undefined} [sessionDetailsValue]
 * @returns {PageContent}
 */
export function changeEiaConsultedBodiesDetailsPage(
	appealData,
	existingValue,
	sessionRadioValue,
	sessionDetailsValue
) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Change consulted relevant statutory consultees',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Change consulted relevant statutory consultees',
		pageComponents: [
			yesNoInput({
				name: 'eiaConsultedBodiesDetailsRadio',
				value: sessionRadioValue === 'yes' || !!existingValue,
				yesConditional: {
					id: 'eia-consulted-bodies-details',
					name: 'eiaConsultedBodiesDetails',
					hint: 'Consulted relevant statutory consultees details',
					details: sessionDetailsValue || existingValue || ''
				}
			})
		]
	};

	return pageContent;
}
