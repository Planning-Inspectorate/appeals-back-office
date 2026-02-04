import appealRepository from '#repositories/appeal.repository.js';
import { buildListOfLinkedAppeals } from '#utils/build-list-of-linked-appeals.js';
import { hasChildAppeals, isLinkedAppeal, isLinkedAppealsActive } from '#utils/is-linked-appeal.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL,
	ERROR_FAILED_TO_SAVE_DATA
} from '@pins/appeals/constants/support.js';
import {
	calculateAppealTimetable,
	getStartCaseNotifyPreviews,
	startCase,
	updateAppealTimetable
} from './appeal-timetables.service.js';

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

		if (isLinkedAppealsActive(appeal)) {
			// In the case of an appeal that is not linked, it will be the only appeal to start
			const appealsToStart = isLinkedAppeal(appeal)
				? await buildListOfLinkedAppeals(appeal)
				: [appeal];

			if (appealsToStart?.length) {
				const results = await Promise.all(
					appealsToStart.map(async (appeal) =>
						startCase(
							appeal,
							startDate,
							notifyClient,
							req.get('azureAdUserId') || '',
							body.procedureType || appeal.procedureType?.key,
							body.hearingStartTime
						)
					)
				);

				if (results.every((result) => result.success)) {
					return res.status(201).send(results[0].timetable);
				} else {
					results
						.filter((result) => !result.success)
						.forEach((result, index) => {
							if (!result.success) {
								logger.error(
									`Could not create timetable for case ${appealsToStart[index].reference}`
								);
							}
						});
					return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
				}
			}
		} else {
			const result = await startCase(
				appeal,
				startDate,
				notifyClient,
				req.get('azureAdUserId') || '',
				body.procedureType || appeal.procedureType?.key,
				body.hearingStartTime
			);

			if (result.success) {
				return res.status(201).send(result.timetable);
			} else {
				logger.error(`Could not create timetable for case ${appeal.reference}`);
				return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
			}
		}
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response|undefined>}
 */
const startAppealNotifyPreview = async (req, res) => {
	const { body, appeal } = req;
	if (appeal && appeal.appealType) {
		let startDate = body.startDate;

		if (!startDate) {
			startDate = new Date().toISOString();
		}

		const notifyClient = req.notifyClient;

		try {
			const result = await getStartCaseNotifyPreviews(
				appeal,
				startDate,
				notifyClient,
				req.get('azureAdUserId') || '',
				body.procedureType || appeal.procedureType?.key,
				body.hearingStartTime,
				body.inquiry
			);
			return res.status(200).send(result);
		} catch (/** @type {any} */ error) {
			logger.error(`Could not generate notify previews for case ${appeal.reference}: ${error}`);
			return res.status(500).send({
				errors: {
					body: stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
						error?.message || 'Unknown error'
					])
				}
			});
		}
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const updateAppealTimetableById = async (req, res) => {
	const { body, appeal, notifyClient } = req;

	try {
		const azureAdUserId = req.get('azureAdUserId') || '';
		await updateAppealTimetable(appeal, body, notifyClient, azureAdUserId);

		if (hasChildAppeals(appeal)) {
			await Promise.all(
				// @ts-ignore
				appeal.childAppeals.map(async (childAppeal) => {
					const child =
						childAppeal.child ||
						(await appealRepository.getAppealById(Number(childAppeal.childId)));
					if (child) {
						return updateAppealTimetable(child, body, notifyClient, azureAdUserId, true);
					}
				})
			);
		}

		const updatedTimetable = {
			lpaQuestionnaireDueDate: body.lpaQuestionnaireDueDate,
			ipCommentsDueDate: body.ipCommentsDueDate,
			lpaStatementDueDate: body.lpaStatementDueDate,
			finalCommentsDueDate: body.finalCommentsDueDate,
			s106ObligationDueDate: body.s106ObligationDueDate,
			issueDeterminationDate: body.issueDeterminationDate,
			statementOfCommonGroundDueDate: body.statementOfCommonGroundDueDate,
			planningObligationDueDate: body.planningObligationDueDate,
			proofOfEvidenceAndWitnessesDueDate: body.proofOfEvidenceAndWitnessesDueDate,
			caseManagementConferenceDueDate: body.caseManagementConferenceDueDate
		};

		return res.send(updatedTimetable);
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getCalculatedAppealTimetable = async (req, res) => {
	const { appeal, query } = req;
	let startDate = query.startDate ? String(query.startDate) : new Date().toISOString();
	const procedureType = String(query.procedureType) || 'written';

	const timetable = await calculateAppealTimetable(appeal, startDate, procedureType);
	return res.send(timetable);
};

export {
	getCalculatedAppealTimetable,
	startAppeal,
	startAppealNotifyPreview,
	updateAppealTimetableById
};
