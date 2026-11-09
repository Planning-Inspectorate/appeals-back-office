import appealStatusRepository from '#repositories/appeal-status.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import appealTimetableRepository from '#repositories/appeal-timetable.repository.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response|undefined>}
 */
export const rollBackAppealStatus = async (req, res) => {
	const { appealId } = req.params;
	const { status } = req.body;

	try {
		const appealStatus = await appealStatusRepository.rollBackAppealStatusTo(
			Number(appealId),
			status
		);
		return res.status(200).json(appealStatus);
	} catch (error) {
		if (error instanceof Error) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Failed to roll back appeal status' });
	}
};


/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response|undefined>}
 */
export const redeterminationRollBackAppealStatus = async (req, res) => {
	const { appealId } = req.params;
	const { status } = req.body;
	const { appeal } = req;

	const currentAppealVersion = appeal.currentAppealVersion;
	const appealTimetable = Array.isArray(appeal.appealTimetable)
		? appeal.appealTimetable[0]
		: appeal.appealTimetable;

	const newAppealTimetable = {
		lpaQuestionnaireDueDate: appealTimetable?.lpaQuestionnaireDueDate ?? null,
		ipCommentsDueDate: null,
		appellantStatementDueDate: null,
		lpaStatementDueDate: null,
		finalCommentsDueDate: null,
		s106ObligationDueDate: null,
		issueDeterminationDate: null,
		statementOfCommonGroundDueDate: null,
		planningObligationDueDate: null,
		proofOfEvidenceAndWitnessesDueDate: null,
		caseManagementConferenceDueDate: null
	};


	try {
		const appealStatus = await appealStatusRepository.rollForwardAppealStatusTo(
			Number(appealId),
			status
		);
		await appealRepository.incrementAppealVersion(Number(appealId));
		await appealTimetableRepository.upsertAppealTimetableById(Number(appealId), currentAppealVersion+1, newAppealTimetable);
		return res.status(200).json(appealStatus);
	} catch (error) {
		if (error instanceof Error) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Failed to roll back appeal status' });
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getAppealStatusCreatedDate = async (req, res) => {
	const { appealId, status } = req.params;
	const statusCreatedDate = await appealStatusRepository.getAppealStatusCreatedDate(
		Number(appealId),
		status
	);
	return res.send(statusCreatedDate);
};
