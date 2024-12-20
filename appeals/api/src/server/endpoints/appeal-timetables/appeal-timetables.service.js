import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import appealRepository from '#repositories/appeal.repository.js';
import appealTimetableRepository from '#repositories/appeal-timetable.repository.js';
import {
	calculateTimetable,
	recalculateDateIfNotBusinessDay,
	setTimeInTimeZone
} from '#utils/business-days.js';
import {
	AUDIT_TRAIL_CASE_TIMELINE_CREATED,
	AUDIT_TRAIL_CASE_TIMELINE_UPDATED,
	AUDIT_TRAIL_SYSTEM_UUID,
	ERROR_NOT_FOUND,
	FRONT_OFFICE_URL
} from '../constants.js';
import transitionState from '#state/transition-state.js';
import BackOfficeAppError from '#utils/app-error.js';
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
		throw new BackOfficeAppError(
			`Timetable with ID ${appealTimetableId} does not exist on appeal with ID ${appeal.id}`,
			404,
			{ appealTimetableId: ERROR_NOT_FOUND }
		);
	}

	next();
};

/**
 *
 * @param {Appeal} appeal
 * @param {string} startDate
 * @param {import('#endpoints/appeals.js').NotifyClient } notifyClient
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * @returns
 */
const startCase = async (appeal, startDate, notifyClient, siteAddress, azureAdUserId) => {
	const appealType = appeal.appealType || null;
	if (!appealType) {
		throw new BackOfficeAppError('Appeal type is required to start a case', 400);
	}

	const startedAt = await recalculateDateIfNotBusinessDay(startDate);
	const timetable = await calculateTimetable(appealType.key, startedAt);
	const startDateWithTimeCorrection = setTimeInTimeZone(startedAt, 0, 0);

	const appellantTemplate = appeal.caseStartedDate
		? config.govNotify.template.appealStartDateChange.appellant
		: config.govNotify.template.appealValidStartCase.appellant;

	const lpaTemplate = appeal.caseStartedDate
		? config.govNotify.template.appealStartDateChange.lpa
		: config.govNotify.template.appealValidStartCase.lpa;

	if (!timetable) {
		return { success: false };
	}

	await Promise.all([
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

	const emailVariables = {
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || '',
		site_address: siteAddress,
		url: FRONT_OFFICE_URL,
		start_date: formatDate(new Date(startDate || ''), false),
		questionnaire_due_date: formatDate(new Date(timetable.lpaQuestionnaireDueDate || ''), false),
		local_planning_authority: appeal.lpa?.name || '',
		appeal_type: appeal.appealType?.type || '',
		procedure_type: PROCEDURE_TYPE_MAP[appeal.procedureType?.key || 'written'],
		appellant_email_address: recipientEmail || ''
	};

	if (recipientEmail) {
		await notifyClient.sendEmail(appellantTemplate, recipientEmail, emailVariables);
	}

	if (lpaEmail) {
		await notifyClient.sendEmail(lpaTemplate, lpaEmail, emailVariables);
	}

	await transitionState(
		appeal.id,
		appealType,
		azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
		appeal.appealStatus,
		APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
	);

	await broadcasters.broadcastAppeal(appeal.id);

	return { success: true, timetable };
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

	await appealTimetableRepository.updateAppealTimetableById(appealTimetableId, processedBody);

	await createAuditTrail({
		appealId: appealId,
		azureAdUserId,
		details: AUDIT_TRAIL_CASE_TIMELINE_UPDATED
	});

	await broadcasters.broadcastAppeal(appealTimetableId);
};

export { checkAppealTimetableExists, startCase, updateAppealTimetable };
