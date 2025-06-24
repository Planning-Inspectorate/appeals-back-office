import { databaseConnector } from '#utils/database-connector.js';
import { sub } from 'date-fns';
import { updateCompletedEvents } from '#endpoints/appeals/appeals.service.js';
import { AUDIT_TRAIL_SYSTEM_UUID } from '@pins/appeals/constants/support.js';
import { APPEAL_START_RANGE } from '@pins/appeals/constants/common.js';
import { getAppealNotifications } from '#repositories/appeal-notification.repository.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const simulateSiteVisitElapsed = async (req, res) => {
	const { appealReference } = req.params;
	const reference = Number(appealReference);
	const appealId = reference - APPEAL_START_RANGE;

	const event = await databaseConnector.siteVisit.findFirst({
		where: { appealId }
	});

	if (event !== null) {
		const { id, ...siteVisitData } = event;

		siteVisitData.visitDate = sub(new Date(), { days: 3 });
		if (siteVisitData.visitStartTime !== null) {
			siteVisitData.visitStartTime = sub(new Date(), { days: 3 });
		}
		if (siteVisitData.visitEndTime !== null) {
			siteVisitData.visitEndTime = sub(new Date(), { days: 3 });
		}

		await databaseConnector.siteVisit.update({
			where: { id },
			data: siteVisitData
		});

		await updateCompletedEvents(AUDIT_TRAIL_SYSTEM_UUID);
		return res.send(true);
	}

	return res.send(false);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const simulateStatementsElapsed = async (req, res) => {
	const { appealReference } = req.params;
	const reference = Number(appealReference);
	const appealId = reference - APPEAL_START_RANGE;

	const timetable = await databaseConnector.appealTimetable.findFirst({
		where: { appealId }
	});

	if (timetable !== null) {
		const { id } = timetable;
		const ipCommentsDueDate = sub(new Date(), { days: 3 });
		const lpaStatementDueDate = sub(new Date(), { days: 3 });
		const appellantStatementDueDate = sub(new Date(), { days: 3 });

		await databaseConnector.appealTimetable.update({
			where: { id },
			data: {
				ipCommentsDueDate,
				lpaStatementDueDate,
				appellantStatementDueDate
			}
		});

		return res.send(true);
	}

	return res.send(false);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const simulateFinalCommentsElapsed = async (req, res) => {
	const { appealReference } = req.params;
	const reference = Number(appealReference);
	const appealId = reference - APPEAL_START_RANGE;

	const timetable = await databaseConnector.appealTimetable.findFirst({
		where: { appealId }
	});

	if (timetable !== null) {
		const { id } = timetable;
		const finalCommentsDueDate = sub(new Date(), { days: 3 });

		await databaseConnector.appealTimetable.update({
			where: { id },
			data: {
				finalCommentsDueDate
			}
		});

		return res.send(true);
	}

	return res.send(false);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const retrieveNotifyEmails = async (req, res) => {
	const { appealReference } = req.params;
	const notifications = await getAppealNotifications(appealReference);

	return res.status(200).send(notifications);
};
