import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/index.js';
import { APPEAL_EIA_ENVIRONMENTAL_IMPACT_SCHEDULE } from 'pins-data-model';
import { snakeCaseToSpaceSeparated, capitalizeFirstLetter } from '#lib/string-utilities.js';

/**
 * @typedef {import('../../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../../lpa-questionnaire.service.js').LpaQuestionnaire} LpaQuestionnaire
 */

/**
 * @param {Appeal} appealData
 * @param {string|null} [existingValue]
 */
export function changeEiaEnvironmentalImpactSchedulePage(appealData, existingValue) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Change development category`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			radiosInput({
				name: 'eiaEnvironmentalImpactSchedule',
				legendText: 'Change development category',
				legendIsPageHeading: true,
				items: [
					...Object.values(APPEAL_EIA_ENVIRONMENTAL_IMPACT_SCHEDULE).map((schedule) => ({
						text: capitalizeFirstLetter(snakeCaseToSpaceSeparated(schedule)),
						value: schedule
					})),
					{
						divider: 'or'
					},
					{
						text: 'Other',
						value: 'other'
					}
				],
				value: existingValue === null ? 'other' : existingValue
			})
		]
	};

	return pageContent;
}

/**
 * @param {string} radioValue
 * @returns {string|null}
 */
export function mapEiaEnvironmentalImpactScheduleRadioValueForService(radioValue) {
	return Object.values(APPEAL_EIA_ENVIRONMENTAL_IMPACT_SCHEDULE).includes(radioValue)
		? radioValue
		: null;
}
