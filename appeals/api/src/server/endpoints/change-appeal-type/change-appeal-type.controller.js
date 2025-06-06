import { databaseConnector } from '#utils/database-connector.js';
import transitionState from '#state/transition-state.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { changeAppealType } from './change-appeal-type.service.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

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
	const { newAppealTypeId, newAppealTypeFinalDate } = req.body;
	const newAppealType = (
		req.appealTypes.find((appealType) => appealType.id === Number(newAppealTypeId))?.type || ''
	).toLowerCase();

	const notifyClient = req.notifyClient;
	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';

	await changeAppealType(
		appeal,
		newAppealTypeId,
		newAppealType || '',
		newAppealTypeFinalDate,
		notifyClient,
		siteAddress,
		req.get('azureAdUserId') || ''
	);

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
		await transitionState(appeal.id, azureAdUserId, APPEAL_CASE_STATUS.AWAITING_TRANSFER),
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
		await transitionState(appeal.id, azureAdUserId, APPEAL_CASE_STATUS.TRANSFERRED),
		await broadcasters.broadcastAppeal(appeal.id)
	]);

	return res.send(true);
};
