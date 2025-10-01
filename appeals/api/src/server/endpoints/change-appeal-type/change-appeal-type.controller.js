import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import {
	changeAppealType,
	markAwaitingTransfer,
	markTransferred,
	resubmitAndMarkInvalid,
	updateAppealType
} from './change-appeal-type.service.js';

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
export const requestResubmitAndMarkInvalid = async (req, res) => {
	const appeal = req.appeal;
	const { newAppealTypeId, newAppealTypeFinalDate, appellantCaseId } = req.body;
	const newAppealType = (
		req.appealTypes.find((appealType) => appealType.id === Number(newAppealTypeId))?.type || ''
	).toLowerCase();

	const notifyClient = req.notifyClient;
	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';

	await resubmitAndMarkInvalid(
		appeal,
		appellantCaseId,
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
	const azureAdUserId = String(req.get('azureAdUserId'));

	await markAwaitingTransfer(req.appeal, req.body.newAppealTypeId, azureAdUserId);

	return res.send(true);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const requestConfirmationTransferOfAppeal = async (req, res) => {
	const azureAdUserId = String(req.get('azureAdUserId'));

	await markTransferred(req.appeal, req.body.newAppealReference, azureAdUserId);

	return res.send(true);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const requestUpdateOfAppeal = async (req, res) => {
	const { newAppealTypeId } = req.body;
	const newAppealType =
		req.appealTypes.find((appealType) => appealType.id === Number(newAppealTypeId))?.type || '';

	await updateAppealType(
		req.appeal,
		newAppealTypeId,
		newAppealType,
		req.get('azureAdUserId') || '',
		req.notifyClient
	);

	return res.send(true);
};
