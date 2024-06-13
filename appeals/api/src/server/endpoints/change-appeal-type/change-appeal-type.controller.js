import { databaseConnector } from '#utils/database-connector.js';
import timetableRepository from '#repositories/appeal-timetable.repository.js';
import {
	STATE_TARGET_AWAITING_TRANSFER,
	STATE_TARGET_CLOSED,
	STATE_TARGET_TRANSFERRED
} from '#endpoints/constants.js';
import transitionState from '#state/transition-state.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getAppealTypes = async (req, res) => {
	const allAppealTypes = req.appealTypes;
	const response = allAppealTypes.filter(
		(appealType) => appealType.key !== req.appeal.appealType?.key
	);
	return res.send(response);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const requestChangeOfAppealType = async (req, res) => {
	const appeal = req.appeal;
	const azureAdUserId = String(req.get('azureAdUserId'));
	const { newAppealTypeId, newAppealTypeFinalDate } = req.body;

	Promise.all([
		await databaseConnector.appeal.update({
			where: { id: appeal.id },
			data: {
				caseResubmittedTypeId: newAppealTypeId,
				caseUpdatedDate: new Date()
			}
		}),
		await timetableRepository.upsertAppealTimetableById(appeal.id, {
			resubmitAppealTypeDate: new Date(newAppealTypeFinalDate)
		}),
		await transitionState(
			appeal.id,
			appeal.appealType,
			azureAdUserId,
			appeal.appealStatus,
			STATE_TARGET_CLOSED
		),
		await broadcasters.broadcastAppeal(appeal.id)
	]);

	return res.send(true);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const requestTransferOfAppeal = async (req, res) => {
	const appeal = req.appeal;
	const azureAdUserId = String(req.get('azureAdUserId'));
	const { newAppealTypeId } = req.body;

	Promise.all([
		await databaseConnector.appeal.update({
			where: { id: appeal.id },
			data: {
				caseResubmittedTypeId: newAppealTypeId,
				caseUpdatedDate: new Date()
			}
		}),
		await transitionState(
			appeal.id,
			appeal.appealType,
			azureAdUserId,
			appeal.appealStatus,
			STATE_TARGET_AWAITING_TRANSFER
		),
		await broadcasters.broadcastAppeal(appeal.id)
	]);

	return res.send(true);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const requestConfirmationTransferOfAppeal = async (req, res) => {
	const appeal = req.appeal;
	const azureAdUserId = String(req.get('azureAdUserId'));
	const { newAppealReference } = req.body;

	Promise.all([
		await databaseConnector.appeal.update({
			where: { id: appeal.id },
			data: {
				caseTransferredId: newAppealReference,
				caseUpdatedDate: new Date()
			}
		}),
		await transitionState(
			appeal.id,
			appeal.appealType,
			azureAdUserId,
			appeal.appealStatus,
			STATE_TARGET_TRANSFERRED
		),
		await broadcasters.broadcastAppeal(appeal.id)
	]);

	return res.send(true);
};
