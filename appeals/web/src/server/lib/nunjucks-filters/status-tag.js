import { capitalizeFirstLetter } from '@pins/appeals/utils/string-case.js';

/**
 * Maps appealStatus values to status-tag text labels
 *
 * @param {string} appealStatus
 * @returns {string}
 */
export function appealStatusToStatusText(appealStatus) {
	if (appealStatus === 'redetermination_stage_1') {
		return 'Redetermination - Stage 1';
	}
	if (appealStatus === 'redetermination_stage_2') {
		return 'Redetermination - Stage 2';
	}
	if (appealStatus === 'redetermined') {
		return 'Redetermined';
	}
	return capitalizeFirstLetter(
		appealStatus
			.replace('issue_determination', 'issue_decision')
			.replace('lpa_', 'LPA_')
			.replace('lpaq_', 'LPAQ_')
			.replaceAll('_', ' ')
	);
}
