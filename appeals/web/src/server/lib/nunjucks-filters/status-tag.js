import { capitalizeFirstLetter } from '#lib/string-utilities.js';

/**
 * Maps appealStatus values to status-tag text labels
 *
 * @param {string} appealStatus
 * @returns {string}
 */
export function appealStatusToStatusTag(appealStatus) {
	return capitalizeFirstLetter(
		appealStatus
			.replace('issue_determination', 'issue_decision')
			.replace('lpa_questionnaire_due', 'lpa_questionnaire') // TODO: remove once status value updates are complete
			.replace('lpa_', 'LPA_')
			.replace('lpaq_', 'LPAQ_')
			.replace('awaiting_event', 'awaiting_site_visit')
			.replace('event', 'site_visit_ready_to_set_up')
			.replaceAll('_', ' ')
	);
}
