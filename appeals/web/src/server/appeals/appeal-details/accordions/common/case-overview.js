import featureFlags from '#common/feature-flags.js';
import { removeSummaryListActions } from '#lib/mappers/index.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { DOCUMENT_STATUS_RECEIVED } from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/** @typedef {import('#appeals/appeal-details/appeal-details.types.d.ts').WebAppeal} WebAppeal */

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {WebAppeal} appealDetails
 * @returns {PageComponent}
 */
export const getCaseOverview = (mappedData, appealDetails) => ({
	type: 'summary-list',
	parameters: {
		rows: [
			showSiteAddressAndLpa(appealDetails)
				? mappedData.appeal.siteAddress.display.summaryListItem
				: undefined,
			showSiteAddressAndLpa(appealDetails)
				? mappedData.appeal.localPlanningAuthority.display.summaryListItem
				: undefined,
			removeSummaryListActions(mappedData.appeal?.lpaReference?.display.summaryListItem),
			mappedData.appeal.appealType.display.summaryListItem,
			showProcedureTypeChangeLink(appealDetails)
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
	}
});

/**
 * @param {import('#lib/appeal-status.js').WebAppeal} appealDetails
 * @returns {boolean}
 */
const showSiteAddressAndLpa = (appealDetails) => {
	return (
		appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY &&
		appealDetails.appealType === APPEAL_TYPE.S78
	);
};

/**
 * @param {import('#lib/appeal-status.js').WebAppeal} appealDetails
 * @returns {boolean}
 */
const showProcedureTypeChangeLink = (appealDetails) => {
	const procedureTypes = [
		FEATURE_FLAG_NAMES.SECTION_78_HEARING,
		FEATURE_FLAG_NAMES.SECTION_78_INQUIRY,
		FEATURE_FLAG_NAMES.SECTION_78
	];

	const activeFlags = procedureTypes.map((p) => {
		return featureFlags.isFeatureActive(p);
	});

	const areMultipleFlagsActive = activeFlags.filter((x) => x === true).length >= 2;

	if (
		appealDetails.appealType !== APPEAL_TYPE.S78 ||
		!areMultipleFlagsActive ||
		appealDetails.documentationSummary.lpaStatement?.status === DOCUMENT_STATUS_RECEIVED
	)
		return false;

	return true;
};
