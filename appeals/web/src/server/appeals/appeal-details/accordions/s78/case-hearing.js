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
export const getCaseHearing = (mappedData, appealDetails, session) => {
	if (
		appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.HEARING ||
		!appealDetails.startedAt
	) {
		return;
	}

	const canEditHearing = userHasPermission(permissionNames.updateCase, session);

	/** @type {PageComponent | undefined} */
	const hearingComponent = appealDetails.hearing
		? {
				type: 'summary-list',
				parameters: { rows: mappedData.appeal.hearingDetails.display.summaryListItems }
		  }
		: canEditHearing
		? mappedData.appeal.setUpHearing.display.buttonItem
		: simpleHtmlComponent('p', { class: 'govuk-body govuk-!-margin-bottom-7' }, 'Not set up');

	const hearingStartTime = appealDetails.hearing?.hearingStartTime;
	const beginningOfHearingDay =
		hearingStartTime && startOfDay(new Date(hearingStartTime)).toISOString();

	/** @type {PageComponent | undefined} */
	const cancelHearingComponent =
		beginningOfHearingDay &&
		dateIsInTheFuture(dateISOStringToDayMonthYearHourMinute(beginningOfHearingDay))
			? mappedData.appeal.cancelHearing.display.htmlItem
			: undefined;

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
		: canEditHearing
		? mappedData.appeal.addHearingEstimates.display.htmlItem
		: simpleHtmlComponent(
				'p',
				{ class: 'govuk-body govuk-!-margin-top-6 govuk-!-margin-bottom-2' },
				'Not set up'
		  );

	return [
		wrapComponents(
			[
				...(cancelHearingComponent ? [cancelHearingComponent] : []),
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
