import { isAppealTypeEnabled } from '#common/feature-flags-appeal-types.js';
import { getNextStateOnStatementsComplete } from '@pins/appeals/utils/business-rules.js';
import { capitalizeFirstLetter } from '@pins/appeals/utils/string-case.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal */
/** @typedef {import('#appeals/personal-list/personal-list.mapper').PersonalListItem} PersonalListItem */

/**
 * @param {string} appealStatus
 * @param {string|undefined} appealType
 * @param {string|undefined} appealProcedureType
 * @returns {string}
 * */
export function mapStatusText(appealStatus, appealType, appealProcedureType) {
	if (!isAppealTypeEnabled(appealType)) {
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
 * @param {WebAppeal|PersonalListItem} appeal
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

/**
 * Uses appeal information to determine the next status on statements complete and convert it into display text
 * @param {string} appealType
 * @param {string} procedureType
 * @param {boolean} isHearingSetup
 * @returns {string}
 */
export function getNextStateDisplayTextOnStatementsComplete(
	appealType,
	procedureType,
	isHearingSetup
) {
	const eventualState = getNextStateOnStatementsComplete(appealType, procedureType, isHearingSetup);

	if (eventualState === APPEAL_CASE_STATUS.EVIDENCE) {
		return 'proof of evidence and witnesses';
	}
	return mapStatusFilterLabel(
		mapStatusText(eventualState, appealType, procedureType)
	).toLowerCase();
}
