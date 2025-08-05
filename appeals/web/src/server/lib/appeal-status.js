import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';

/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal */

/**
 * @param {string} appealStatus
 * @param {string} appealType
 * @param {string|undefined} appealProcedureType
 * @returns {string}
 * */
export function mapStatusText(appealStatus, appealType, appealProcedureType) {
	if (![APPEAL_TYPE.HOUSEHOLDER, APPEAL_TYPE.S78].includes(appealType)) {
		return appealStatus;
	}

	switch (appealStatus) {
		case 'event':
			return `${mapAppealProcedureTypeToEventName(appealProcedureType)}_ready_to_set_up`;
		case 'awaiting_event':
			return `awaiting_${mapAppealProcedureTypeToEventName(appealProcedureType)}`;
		default:
			return appealStatus;
	}
}

/**
 * Returns the name of the event associated with the supplied procedure type (eg. site visit, hearing, inquiry)
 * @param {string|undefined} appealProcedureType
 * @returns {'hearing'|'inquiry'|'site_visit'} see `appeals/web/src/server/views/appeals/components/status-tag.njk` for usage
 */
export function mapAppealProcedureTypeToEventName(appealProcedureType) {
	const lowercaseProcedureType = appealProcedureType?.toLowerCase();

	switch (lowercaseProcedureType) {
		case 'hearing':
			return 'hearing';
		case 'inquiry':
			return 'inquiry';
		case 'written':
		default:
			return 'site_visit';
	}
}

/**
 * Returns true if the given state was previously passed through.
 *
 * @param {WebAppeal} appeal
 * @param {string} state
 * @returns {boolean}
 * */
export function isStatePassed(appeal, state) {
	const { completedStateList = [] } = appeal;

	return completedStateList.includes(state);
}

/**
 * Maps appealStatus values to status filter dropdown labels
 * @param {string} appealStatus
 * @returns {string}
 */
export function mapStatusFilterLabel(appealStatus) {
	return capitalizeFirstLetter(
		appealStatus
			.replace('issue_determination', 'issue_decision')
			.replace('lpa_', 'LPA_')
			.replace(/^event$/, 'event_ready_to_set_up')
			.replaceAll('_', ' ')
	);
}
