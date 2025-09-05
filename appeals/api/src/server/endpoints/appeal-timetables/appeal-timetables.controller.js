import { buildListOfLinkedAppeals } from '#utils/build-list-of-linked-appeals.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import { isLinkedAppeal } from '#utils/is-linked-appeal.js';
import logger from '#utils/logger.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';
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

		if (isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS)) {
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
							body.procedureType || appeal.procedureType?.key
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
				body.procedureType || appeal.procedureType?.key
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
 * @returns {Promise<Response>}
 */
const updateAppealTimetableById = async (req, res) => {
	const { body, appeal, notifyClient } = req;

	try {
		await updateAppealTimetable(appeal, body, notifyClient, req.get('azureAdUserId') || '');

		const updatedTimetable = {
			lpaQuestionnaireDueDate: body.lpaQuestionnaireDueDate,
			ipCommentsDueDate: body.ipCommentsDueDate,
			appellantStatementDueDate: body.appellantStatementDueDate,
			lpaStatementDueDate: body.lpaStatementDueDate,
			finalCommentsDueDate: body.finalCommentsDueDate,
			s106ObligationDueDate: body.s106ObligationDueDate,
			issueDeterminationDate: body.issueDeterminationDate,
			statementOfCommonGroundDueDate: body.statementOfCommonGroundDueDate,
			planningObligationDueDate: body.planningObligationDueDate,
			proofOfEvidenceAndWitnessesDueDate: body.proofOfEvidenceAndWitnessesDueDate
		};

		return res.send(updatedTimetable);
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}
};

export { startAppeal, updateAppealTimetableById };
