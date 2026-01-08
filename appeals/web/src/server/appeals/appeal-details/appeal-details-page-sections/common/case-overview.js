import featureFlags from '#common/feature-flags.js';
import { dateIsInThePast, dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { removeSummaryListActions } from '#lib/mappers/index.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import {
	APPEAL_CASE_STATUS,
	APPEAL_REPRESENTATION_STATUS
} from '@planning-inspectorate/data-model';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @returns {PageComponent}
 */
export const getCaseOverview = (mappedData, appealDetails) => ({
	type: 'summary-list',
	parameters: {
		rows: [
			removeSummaryListActions(mappedData.appeal?.lpaReference?.display.summaryListItem),
			displayHorizonReference(appealDetails)
				? mappedData.appeal?.horizonReference?.display.summaryListItem
				: undefined,
			mappedData.appeal.appealType.display.summaryListItem,

			displayProcedureChangeLink(appealDetails)
				? mappedData.appeal?.caseProcedure?.display.summaryListItem
				: removeSummaryListActions(mappedData.appeal?.caseProcedure?.display.summaryListItem),
			mappedData.appeal?.allocationDetails?.display.summaryListItem,
			mappedData.appeal?.linkedAppeals?.display.summaryListItem,
			mappedData.appeal?.otherAppeals?.display.summaryListItem,
			mappedData.appeal?.netResidenceChange?.display.summaryListItem,
			mappedData.appeal?.netResidenceGainOrLoss?.display.summaryListItem,
			mappedData.appeal?.decision?.display.summaryListItem,
			mappedData.appeal?.costsAppellantDecision?.display.summaryListItem,
			mappedData.appeal?.costsLpaDecision?.display.summaryListItem
		].filter(isDefined)
	},
	wrapperHtml: {
		opening: '<h2 class="govuk-heading-l">Overview</h2>',
		closing: ''
	}
});

/**
 * @param {import('#lib/appeal-status.js').WebAppeal} appealDetails
 * @returns {boolean}
 */
const displayProcedureChangeLink = (appealDetails) => {
	if (!featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.CHANGE_PROCEDURE_TYPE)) {
		return false;
	}

	const { representationStatus: lpaStatementrepresentationStatus } =
		appealDetails.documentationSummary?.lpaStatement ?? {};
	const { representationStatus: ipCommentsrepresentationStatus } =
		appealDetails.documentationSummary?.ipComments ?? {};
	const lpaStatementDueDateElapsed = appealDetails.appealTimetable?.lpaStatementDueDate
		? dateIsInThePast(
				dateISOStringToDayMonthYearHourMinute(appealDetails.appealTimetable.lpaStatementDueDate)
		  )
		: false;
	const ipCommentsDueDateElapsed = appealDetails.appealTimetable?.ipCommentsDueDate
		? dateIsInThePast(
				dateISOStringToDayMonthYearHourMinute(appealDetails.appealTimetable.ipCommentsDueDate)
		  )
		: false;

	if (
		![APPEAL_TYPE.S78, APPEAL_TYPE.ENFORCEMENT_NOTICE].includes(appealDetails.appealType) ||
		lpaStatementrepresentationStatus === APPEAL_REPRESENTATION_STATUS.PUBLISHED ||
		ipCommentsrepresentationStatus === APPEAL_REPRESENTATION_STATUS.PUBLISHED ||
		lpaStatementDueDateElapsed ||
		ipCommentsDueDateElapsed
	)
		return false;

	return true;
};

/**
 * @param {import('#lib/appeal-status.js').WebAppeal} appealDetails
 * @returns {boolean}
 */
const displayHorizonReference = (appealDetails) => {
	const appealCaseStatusTransfer =
		appealDetails.appealStatus === APPEAL_CASE_STATUS.AWAITING_TRANSFER ||
		appealDetails.appealStatus === APPEAL_CASE_STATUS.TRANSFERRED;
	return appealCaseStatusTransfer;
};
