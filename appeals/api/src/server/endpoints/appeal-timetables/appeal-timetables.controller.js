import BackOfficeAppError from '#utils/app-error.js';
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

	if (!appeal?.appealType) {
		throw new BackOfficeAppError('Cannot start appeal -- missing appeal type', 500);
	}

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

	if (!result.success) {
		throw new BackOfficeAppError(`Could not create timetable for case ${appeal.reference}`, 500, {
			body: ERROR_FAILED_TO_SAVE_DATA
		});
	}

	return res.send(result.timetable);
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

	await updateAppealTimetable(appealId, appealTimetableId, body, req.get('azureAdUserId') || '');

	const updatedTimetable = {
		lpaQuestionnaireDueDate: body.lpaQuestionnaireDueDate,
		ipCommentsDueDate: body.ipCommentsDueDate,
		appellantStatementDueDate: body.appellantStatementDueDate,
		lpaStatementDueDate: body.lpaStatementDueDate,
		appellantFinalCommentsDueDate: body.appellantFinalCommentsDueDate,
		lpaFinalCommentsDueDate: body.lpaFinalCommentsDueDate,
		s106ObligationDueDate: body.s106ObligationDueDate,
		issueDeterminationDate: body.issueDeterminationDate
	};

	return res.send(updatedTimetable);
};

export { updateAppealTimetableById, startAppeal };
