import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.AppealStatus} AppealStatus */

/**
 *
 * @param {AppealStatus[]} appealStatuses
 */
export const isCaseInvalid = (appealStatuses) =>
	appealStatuses.find(
		(appealStatus) =>
			appealStatus.status === APPEAL_CASE_STATUS.INVALID && appealStatus.valid === true
	) &&
	appealStatuses.find(
		(appealStatus) => appealStatus.status === APPEAL_CASE_STATUS.ISSUE_DETERMINATION
	);
