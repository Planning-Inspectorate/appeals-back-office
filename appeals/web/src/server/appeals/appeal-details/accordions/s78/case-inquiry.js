import { wrapComponents } from '#lib/mappers/index.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @returns {PageComponent[]|undefined}
 */
export const getCaseInquiry = (mappedData, appealDetails) => {
	if (
		appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY ||
		!appealDetails.startedAt ||
		!mappedData.appeal.addInquiryEstimates.display.htmlItem
	) {
		return;
	}

	/** @type {PageComponent} */
	const inquiryComponent = {
		type: 'summary-list',
		parameters: { rows: mappedData.appeal.inquiryDetails.display.summaryListItems }
	};

	/** @type {PageComponent} */
	const inquiryEstimatesHeading = {
		type: 'html',
		parameters: { html: '<h3 class="govuk-heading-m">Inquiry estimates</h3>' }
	};

	/** @type {PageComponent | undefined} */
	const inquiryEstimatesComponent = appealDetails.inquiryEstimate
		? {
				type: 'summary-list',
				parameters: { rows: mappedData.appeal.inquiryEstimates.display.summaryListItems }
		  }
		: mappedData.appeal.addInquiryEstimates.display.htmlItem;

	return [
		wrapComponents(
			[
				...(inquiryComponent ? [inquiryComponent] : []),
				inquiryEstimatesHeading,
				...(inquiryEstimatesComponent ? [inquiryEstimatesComponent] : [])
			],
			{
				opening: '<div id="case-details-inquiry-section">',
				closing: '</div>'
			}
		)
	];
};
