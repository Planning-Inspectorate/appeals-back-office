import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import appealTimetableRepository from '#repositories/appeal-timetable.repository.js';
import logger from '#utils/logger.js';
import { format } from 'date-fns';
import {
	AUDIT_TRAIL_CASE_TIMELINE_UPDATED,
	DEFAULT_DATE_FORMAT_DATABASE,
	ERROR_FAILED_TO_SAVE_DATA
} from '../constants.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { startCase } from './appeal-timetables.service.js';

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

		const notifyClient = req.notifyClient;
		const siteAddress = appeal.address
			? formatAddressSingleLine(appeal.address)
			: 'Address not available';

		const result = await startCase(
			appeal,
			startDate,
			notifyClient,
			siteAddress,
			req.get('azureAdUserId') || ''
		);

		if (result.success) {
			return res.send(result.timetable);
		} else {
			logger.error(`Could not create timetable for case ${appeal.reference}`);
			return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
		}
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
