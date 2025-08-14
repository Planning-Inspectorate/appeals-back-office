import featureFlags from '#common/feature-flags.js';
import { removeSummaryListActions } from '#lib/mappers/index.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { APPEAL_REPRESENTATION_STATUS } from '@planning-inspectorate/data-model';

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

	const procedureTypes = [
		FEATURE_FLAG_NAMES.SECTION_78_HEARING,
		FEATURE_FLAG_NAMES.SECTION_78_INQUIRY,
		FEATURE_FLAG_NAMES.SECTION_78
	];

	const activeFlags = procedureTypes.map((p) => {
		return featureFlags.isFeatureActive(p);
	});

	const areMultipleFlagsActive = activeFlags.filter((x) => x === true).length >= 2;

	const { representationStatus } = appealDetails.documentationSummary?.lpaStatement ?? {};

	if (
		appealDetails.appealType !== APPEAL_TYPE.S78 ||
		!areMultipleFlagsActive ||
		representationStatus === APPEAL_REPRESENTATION_STATUS.PUBLISHED
	)
		return false;

	return true;
};
