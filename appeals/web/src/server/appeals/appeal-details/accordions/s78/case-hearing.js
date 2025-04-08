import { wrapComponents } from '#lib/mappers/index.js';
import { APPEAL_CASE_PROCEDURE } from 'pins-data-model';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @returns {PageComponent[]|undefined}
 */
export const getCaseHearing = (mappedData, appealDetails) => {
	if (
		appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.HEARING ||
		!appealDetails.startedAt ||
		!(
			mappedData.appeal.setUpHearing.display.buttonItem ||
			mappedData.appeal.addHearingEstimates.display.htmlItem
		)
	) {
		return;
	}

	return [
		wrapComponents(
			[
				...(mappedData.appeal.setUpHearing.display.buttonItem
					? [mappedData.appeal.setUpHearing.display.buttonItem]
					: []),
				...(mappedData.appeal.addHearingEstimates.display.htmlItem
					? [mappedData.appeal.addHearingEstimates.display.htmlItem]
					: [])
			],
			{
				opening: '<div id="case-details-hearing-section">',
				closing: '</div>'
			}
		)
	];
};
