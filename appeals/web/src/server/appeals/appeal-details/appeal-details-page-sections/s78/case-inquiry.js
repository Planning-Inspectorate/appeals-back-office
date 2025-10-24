import { dateIsInTheFuture, dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { wrapComponents } from '#lib/mappers/index.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { startOfDay } from 'date-fns';

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
	const inquiryStartTime = appealDetails.inquiry?.inquiryStartTime;

	const beginningOfInquiryDay =
		inquiryStartTime && startOfDay(new Date(inquiryStartTime)).toISOString();

	/** @type {PageComponent | undefined} */
	const cancelInquiryComponent =
		beginningOfInquiryDay &&
		dateIsInTheFuture(dateISOStringToDayMonthYearHourMinute(beginningOfInquiryDay))
			? mappedData.appeal.cancelInquiry.display.htmlItem
			: undefined;

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
				...(cancelInquiryComponent ? [cancelInquiryComponent] : []),
				...(inquiryComponent ? [inquiryComponent] : []),
				inquiryEstimatesHeading,
				...(inquiryEstimatesComponent ? [inquiryEstimatesComponent] : [])
			],
			{
				opening: '<h2 class="govuk-heading-l">Inquiry</h2><div id="case-details-inquiry-section">',
				closing: '</div>'
			}
		)
	];
};
