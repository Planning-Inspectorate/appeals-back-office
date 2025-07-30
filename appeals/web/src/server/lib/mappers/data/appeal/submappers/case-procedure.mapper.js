import featureFlags from '#common/feature-flags.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { DOCUMENT_STATUS_RECEIVED } from '@pins/appeals/constants/support.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCaseProcedure = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	if (!appealDetails.appealTimetable) {
		return { id: 'case-procedure', display: {} };
	}

	return textSummaryListItem({
		id: 'case-procedure',
		text: 'Appeal procedure',
		value: appealDetails.procedureType || 'No data',
		link: includeChangeLink(appealDetails)
			? `${currentRoute}/change-appeal-details/case-procedure`
			: '',
		editable: userHasUpdateCasePermission,
		classes: 'appeal-case-procedure'
	});
};

/**
 * @param {import('#lib/appeal-status.js').WebAppeal} appealDetails
 * @returns {boolean}
 */
const includeChangeLink = (appealDetails) => {
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
