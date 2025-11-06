import { permissionNames } from '#environment/permissions.js';
import { dateIsInTheFuture, dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { simpleHtmlComponent, userHasPermission, wrapComponents } from '#lib/mappers/index.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { startOfDay } from 'date-fns';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('express-session').Session} session
 * @returns {PageComponent[]|undefined}
 */
export const getCaseInquiry = (mappedData, appealDetails, session) => {
	if (
		appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY ||
		!appealDetails.startedAt ||
		!mappedData.appeal.addInquiryEstimates.display.htmlItem
	) {
		return;
	}

	const canEditInquiry = userHasPermission(permissionNames.updateCase, session);

	/** @type {PageComponent | undefined} */
	const inquiryComponent = appealDetails.inquiry
		? {
				type: 'summary-list',
				parameters: { rows: mappedData.appeal.inquiryDetails.display.summaryListItems }
		  }
		: canEditInquiry
		? mappedData.appeal.setUpInquiry.display.buttonItem
		: simpleHtmlComponent('p', { class: 'govuk-body govuk-!-margin-bottom-7' }, 'Not set up');

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
		: canEditInquiry
		? mappedData.appeal.addInquiryEstimates.display.htmlItem
		: simpleHtmlComponent(
				'p',
				{ class: 'govuk-body govuk-!-margin-top-6 govuk-!-margin-bottom-2' },
				'Not set up'
		  );

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
