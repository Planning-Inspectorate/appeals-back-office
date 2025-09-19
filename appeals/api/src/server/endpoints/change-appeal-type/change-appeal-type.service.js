import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { notifySend } from '#notify/notify-send.js';
import timetableRepository from '#repositories/appeal-timetable.repository.js';
import appellantCaseRepository from '#repositories/appellant-case.repository.js';
import transitionState from '#state/transition-state.js';
import { databaseConnector } from '#utils/database-connector.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';
import {
	AUDIT_TRAIL_APPEAL_TYPE_UPDATED,
	AUDIT_TRAIL_SUBMISSION_INVALID,
	VALIDATION_OUTCOME_INVALID
} from '@pins/appeals/constants/support.js';
import { setTimeInTimeZone } from '@pins/appeals/utils/business-days.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {Appeal} appeal
 * @param {number} newAppealTypeId
 * @param {string} newAppealType
 * @param {string} dueDate
 * @param {import('#endpoints/appeals.js').NotifyClient } notifyClient
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
const changeAppealType = async (
	appeal,
	newAppealTypeId,
	newAppealType,
	dueDate,
	notifyClient,
	siteAddress,
	azureAdUserId
) => {
	Promise.all([
		await databaseConnector.appeal.update({
			where: { id: appeal.id },
			data: {
				caseResubmittedTypeId: newAppealTypeId,
				caseUpdatedDate: new Date()
			}
		}),
		await timetableRepository.upsertAppealTimetableById(appeal.id, {
			caseResubmissionDueDate: setTimeInTimeZone(dueDate, DEADLINE_HOUR, DEADLINE_MINUTE)
		}),
		await transitionState(appeal.id, azureAdUserId, APPEAL_CASE_STATUS.CLOSED),
		await broadcasters.broadcastAppeal(appeal.id)
	]);

	const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
	const personalisation = {
		existing_appeal_type: appeal.appealType?.type || '',
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || '',
		site_address: siteAddress,
		due_date: formatDate(new Date(dueDate || ''), false),
		appeal_type: newAppealType || '',
		team_email_address: await getTeamEmailFromAppealId(appeal.id)
	};

	if (recipientEmail) {
		await notifySend({
			azureAdUserId,
			templateName: 'appeal-type-change-non-has',
			notifyClient,
			recipientEmail,
			personalisation
		});
	}
};

/**
 * @param {Appeal} appeal
 * @param {number} appellantCaseId
 * @param {number} newAppealTypeId
 * @param {string} newAppealType
 * @param {string} dueDate
 * @param {import('#endpoints/appeals.js').NotifyClient } notifyClient
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
const resubmitAndMarkInvalid = async (
	appeal,
	appellantCaseId,
	newAppealTypeId,
	newAppealType,
	dueDate,
	notifyClient,
	siteAddress,
	azureAdUserId
) => {
	const { id: appealId } = appeal;
	Promise.all([
		await databaseConnector.appeal.update({
			where: { id: appealId },
			data: {
				caseResubmittedTypeId: newAppealTypeId,
				caseUpdatedDate: new Date()
			}
		}),
		await timetableRepository.upsertAppealTimetableById(appealId, {
			caseResubmissionDueDate: setTimeInTimeZone(dueDate, DEADLINE_HOUR, DEADLINE_MINUTE)
		}),
		await appellantCaseRepository.updateAppellantCaseValidationOutcome({
			appealId,
			appellantCaseId,
			validationOutcomeId: 2,
			invalidReasons: [{ id: 4, text: ['Wrong appeal type, resubmission required'] }]
		}),
		await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_INVALID)
	]);

	await broadcasters.broadcastAppeal(appealId);

	const details = `${AUDIT_TRAIL_SUBMISSION_INVALID} wrong appeal type`;

	await createAuditTrail({
		appealId,
		azureAdUserId,
		details
	});

	const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
	const personalisation = {
		existing_appeal_type: appeal.appealType?.type || '',
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || '',
		site_address: siteAddress,
		due_date: formatDate(new Date(dueDate || ''), false),
		appeal_type: newAppealType || ''
	};

	if (recipientEmail) {
		await notifySend({
			azureAdUserId,
			templateName: 'appeal-type-change-non-has',
			notifyClient,
			recipientEmail,
			personalisation
		});
	}
};

/**
 * @param {Appeal} appeal
 * @param {number} newAppealTypeId
 * @param {string} newAppealType
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
const updateAppealType = async (appeal, newAppealTypeId, newAppealType, azureAdUserId) => {
	Promise.all([
		await databaseConnector.appeal.update({
			where: { id: appeal.id },
			data: {
				appealTypeId: newAppealTypeId
			}
		}),
		await createAuditTrail({
			appealId: appeal.id,
			azureAdUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_TYPE_UPDATED, [newAppealType])
		})
	]);

	// To do
	// Add notifies & broadcast
};

export { changeAppealType, resubmitAndMarkInvalid, updateAppealType };
