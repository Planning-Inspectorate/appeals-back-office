import logger from '#utils/logger.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '../constants.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { startCase, updateAppealTimetable } from './appeal-timetables.service.js';

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
			startDate = new Date().toISOString();
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
	const { body, params, appeal } = req;
	const appealTimetableId = Number(params.appealTimetableId);
	const appealId = Number(appeal.id);

	try {
		await updateAppealTimetable(appealId, appealTimetableId, body, req.get('azureAdUserId') || '');

		const updatedTimetable = {
			finalCommentReviewDate: body.finalCommentReviewDate,
			issueDeterminationDate: body.issueDeterminationDate,
			lpaQuestionnaireDueDate: body.lpaQuestionnaireDueDate,
			statementReviewDate: body.statementReviewDate
		};

		return res.send(updatedTimetable);
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}
};

export { updateAppealTimetableById, startAppeal };
