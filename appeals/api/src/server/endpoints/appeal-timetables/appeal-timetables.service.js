import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import appealRepository from '#repositories/appeal.repository.js';
import appealTimetableRepository from '#repositories/appeal-timetable.repository.js';
import {
	calculateTimetable,
	recalculateDateIfNotBusinessDay,
	setTimeInTimeZone
} from '#utils/business-days.js';
import logger from '#utils/logger.js';
import {
	AUDIT_TRAIL_CASE_TIMELINE_CREATED,
	AUDIT_TRAIL_CASE_TIMELINE_UPDATED,
	AUDIT_TRAIL_SYSTEM_UUID,
	ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL,
	ERROR_NOT_FOUND,
	FRONT_OFFICE_URL
} from '@pins/appeals/constants/support.js';
import transitionState from '#state/transition-state.js';
import formatDate from '#utils/date-formatter.js';
import config from '#config/config.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { PROCEDURE_TYPE_MAP } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
const checkAppealTimetableExists = async (req, res, next) => {
	const {
		appeal,
		params: { appealTimetableId }
	} = req;
	const hasAppealTimetable = appeal.appealTimetable?.id === Number(appealTimetableId);

	if (!hasAppealTimetable) {
		return res.status(404).send({ errors: { appealTimetableId: ERROR_NOT_FOUND } });
	}

	next();
};

/**
 *
 * @param {Appeal} appeal
 * @param {string} startDate
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * @returns
 */
const startCase = async (appeal, startDate, notifyClient, siteAddress, azureAdUserId) => {
	try {
		const appealType = appeal.appealType || null;
		if (!appealType) {
			throw new Error('Appeal type is required to start a case.');
		}

		const startedAt = await recalculateDateIfNotBusinessDay(startDate);
		const timetable = await calculateTimetable(appealType.key, startedAt);
		const startDateWithTimeCorrection = setTimeInTimeZone(startedAt, 0, 0);

		/** @type {Record<string, string>} */
		const appealTypeMap = {
			D: 'has',
			W: 's78'
		};

		const appellantTemplate = appeal.caseStartedDate
			? config.govNotify.template.appealStartDateChange.appellant
			: config.govNotify.template.appealValidStartCase[appealTypeMap[appealType.key]].appellant;

		const lpaTemplate = appeal.caseStartedDate
			? config.govNotify.template.appealStartDateChange.lpa
			: config.govNotify.template.appealValidStartCase[appealTypeMap[appealType.key]].lpa;

		if (timetable) {
			await Promise.all([
				// @ts-ignore
				appealTimetableRepository.upsertAppealTimetableById(appeal.id, timetable),
				appealRepository.updateAppealById(appeal.id, {
					caseStartedDate: startDateWithTimeCorrection.toISOString()
				})
			]);

			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId,
				details: AUDIT_TRAIL_CASE_TIMELINE_CREATED
			});

			const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
			const lpaEmail = appeal.lpa?.email || '';

			// Note that those properties not used within the specified template will be ignored
			const commonEmailVariables = {
				appeal_reference_number: appeal.reference,
				lpa_reference: appeal.applicationReference || '',
				site_address: siteAddress,
				start_date: formatDate(new Date(startDate || ''), false),
				appellant_email_address: recipientEmail || '',
				url: FRONT_OFFICE_URL,
				appeal_type: appeal.appealType?.type || '',
				procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType?.key || 'written'],
				questionnaire_due_date: formatDate(
					new Date(timetable.lpaQuestionnaireDueDate || ''),
					false
				),
				local_planning_authority: appeal.lpa?.name || '',
				due_date: formatDate(new Date(timetable.lpaQuestionnaireDueDate || ''), false),
				comment_deadline: formatDate(new Date(timetable.commentDeadline || ''), false),
				final_comments_deadline: formatDate(new Date(timetable.finalCommentsDueDate || ''), false)
			};

			if (recipientEmail) {
				try {
					await notifyClient.sendEmail(appellantTemplate, recipientEmail, commonEmailVariables);
				} catch (error) {
					throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
				}
			}

			if (lpaEmail) {
				try {
					await notifyClient.sendEmail(lpaTemplate, lpaEmail, commonEmailVariables);
				} catch (error) {
					throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
				}
			}

			await transitionState(
				appeal.id,
				azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
			);

			await broadcasters.broadcastAppeal(appeal.id);
			return { success: true, timetable };
		}
	} catch (error) {
		logger.error(`Error starting case for appeal ID ${appeal.id}: ${error}`);
	}

	return { success: false };
};

/**
 * @param {number} appealId
 * @param {number} appealTimetableId
 * @param {object} body
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
const updateAppealTimetable = async (appealId, appealTimetableId, body, azureAdUserId) => {
	const processedBody = Object.fromEntries(
		Object.entries(body).map(([item, value]) => [
			item,
			setTimeInTimeZone(value, DEADLINE_HOUR, DEADLINE_MINUTE).toISOString()
		])
	);

	// @ts-ignore
	await appealTimetableRepository.updateAppealTimetableById(appealTimetableId, processedBody);

	await createAuditTrail({
		appealId: appealId,
		azureAdUserId,
		details: AUDIT_TRAIL_CASE_TIMELINE_UPDATED
	});

	await broadcasters.broadcastAppeal(appealId);
};

export { checkAppealTimetableExists, startCase, updateAppealTimetable };
