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
		title: 'Does the development meet or exceed the threshold or criteria in column 2?',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'eiaColumnTwoThreshold',
				value: existingValue,
				legendText: 'Does the development meet or exceed the threshold or criteria in column 2?',
				legendIsPageHeading: true
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
		title: 'Did your screening opinion say the development needed an environmental statement?',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'eiaRequiresEnvironmentalStatement',
				value: existingValue,
				legendText:
					'Did your screening opinion say the development needed an environmental statement?',
				legendIsPageHeading: true
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
		title: 'Is the development in, partly in, or likely to affect a sensitive area?',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Is the development in, partly in, or likely to affect a sensitive area?',
		pageComponents: [
			yesNoInput({
				name: 'eiaSensitiveAreaDetailsRadio',
				value: sessionRadioValue === 'yes' || Boolean(existingValue),
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
		title: 'Did you consult all the relevant statutory consultees about the development?',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Did you consult all the relevant statutory consultees about the development?',
		pageComponents: [
			yesNoInput({
				name: 'eiaConsultedBodiesDetailsRadio',
				value: sessionRadioValue === 'yes' || Boolean(existingValue),
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
