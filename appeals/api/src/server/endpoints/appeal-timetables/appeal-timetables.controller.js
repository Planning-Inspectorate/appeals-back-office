import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import appealRepository from '#repositories/appeal.repository.js';
import appealTimetableRepository from '#repositories/appeal-timetable.repository.js';
import { calculateTimetable, recalculateDateIfNotBusinessDay } from '#utils/business-days.js';
import joinDateAndTime from '#utils/join-date-and-time.js';
import logger from '#utils/logger.js';
import { format } from 'date-fns';
import {
	AUDIT_TRAIL_CASE_TIMELINE_CREATED,
	AUDIT_TRAIL_CASE_TIMELINE_UPDATED,
	AUDIT_TRAIL_SYSTEM_UUID,
	DEFAULT_DATE_FORMAT_DATABASE,
	ERROR_FAILED_TO_SAVE_DATA,
	STATE_TARGET_LPA_QUESTIONNAIRE_DUE
} from '../constants.js';
import transitionState from '#state/transition-state.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response|undefined>}
 */
const startAppeal = async (req, res) => {
	const { body, appeal } = req;
	if (appeal && appeal.appealType) {
		let startDate = body.startDate;

		if (!startDate) {
			startDate = format(new Date(), DEFAULT_DATE_FORMAT_DATABASE);
		}

		const startedAt = await recalculateDateIfNotBusinessDay(joinDateAndTime(startDate));

		const azureAdUserId = req.get('azureAdUserId');
		const timetable = await calculateTimetable(appeal.appealType.shorthand, startedAt);
		if (timetable) {
			await Promise.all([
				await appealTimetableRepository.upsertAppealTimetableById(appeal.id, timetable),
				await appealRepository.updateAppealById(appeal.id, { startedAt: startedAt.toISOString() })
			]);

			await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId,
				details: AUDIT_TRAIL_CASE_TIMELINE_CREATED
			});

			/*
			await notifyClient.sendEmail(
				config.govNotify.template.validAppellantCase,
				appellant?.email || agent?.email,
				{
					appeal_reference: reference,
					appeal_type: appealType.shorthand,
					date_started: format(startedAt, DEFAULT_DATE_FORMAT_DISPLAY)
				}
			);
			*/

			await transitionState(
				appeal.id,
				appeal.appealType,
				azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
				appeal.appealStatus,
				STATE_TARGET_LPA_QUESTIONNAIRE_DUE
			);

			await broadcasters.broadcastAppeal(appeal.id);
			return res.send(timetable);
		}

		logger.error(
			`Could not create timetable with a start date ${startedAt} for case ${appeal.reference}`
		);
		return res.status(500);
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const updateAppealTimetableById = async (req, res) => {
	const { body, params } = req;
	const appealTimetableId = Number(params.appealTimetableId);

	try {
		await appealTimetableRepository.updateAppealTimetableById(appealTimetableId, body);

		await createAuditTrail({
			appealId: Number(params.appealId),
			azureAdUserId: req.get('azureAdUserId'),
			details: AUDIT_TRAIL_CASE_TIMELINE_UPDATED
		});

		await broadcasters.broadcastAppeal(Number(params.appealId));
	} catch (error) {
		if (error) {
			logger.error(error);
			return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
		}
	}

	return res.send(body);
};

export { updateAppealTimetableById, startAppeal };
