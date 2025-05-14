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

	/** @type {PageComponent | undefined} */
	const hearingComponent = appealDetails.hearing
		? {
				type: 'summary-list',
				parameters: { rows: mappedData.appeal.hearingDetails.display.summaryListItems }
		  }
		: mappedData.appeal.setUpHearing.display.buttonItem;

	/** @type {PageComponent} */
	const hearingEstimatesHeading = {
		type: 'html',
		parameters: { html: '<h3 class="govuk-heading-m">Hearing estimates</h3>' }
	};

	/** @type {PageComponent | undefined} */
	const hearingEstimatesComponent = appealDetails.hearingEstimate
		? {
				type: 'summary-list',
				parameters: { rows: mappedData.appeal.hearingEstimates.display.summaryListItems }
		  }
		: mappedData.appeal.addHearingEstimates.display.htmlItem;

	return [
		wrapComponents(
			[
				...(hearingComponent ? [hearingComponent] : []),
				hearingEstimatesHeading,
				...(hearingEstimatesComponent ? [hearingEstimatesComponent] : [])
			],
			{
				opening: '<div id="case-details-hearing-section">',
				closing: '</div>'
			}
		)
	];
};
