import { ERROR_NOT_FOUND, ERROR_INVALID_APPEAL_STATE } from '@pins/appeals/constants/support.js';
import { getAllAppealTypes } from '#repositories/appeal-type.repository.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { currentStatus, isCurrentStatus } from '#utils/current-status.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
export const loadAllAppealTypesAndAddToRequest = async (req, res, next) => {
	const allAppealTypes = await getAllAppealTypes();
	req.appealTypes = allAppealTypes;
	next();
};

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const validateAppealType = async (req, res, next) => {
	const { newAppealTypeId } = req.body;
	const match =
		req.appealTypes.findIndex((appealType) => appealType.id === Number(newAppealTypeId)) > -1;
	if (!match) {
		return res.status(400).send({ errors: { newAppealTypeId: ERROR_NOT_FOUND } });
	}
	next();
};

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const validateAppealStatus = async (req, res, next) => {
	const isInvalidStatus = [
		APPEAL_CASE_STATUS.CLOSED,
		APPEAL_CASE_STATUS.COMPLETE,
		APPEAL_CASE_STATUS.INVALID,
		APPEAL_CASE_STATUS.AWAITING_TRANSFER,
		APPEAL_CASE_STATUS.TRANSFERRED,
		APPEAL_CASE_STATUS.WITHDRAWN
	].includes(currentStatus(req.appeal));

	if (isInvalidStatus) {
		return res.status(400).send({ errors: { appealStatus: ERROR_INVALID_APPEAL_STATE } });
	}
	next();
};

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const validateAppealStatusForTransfer = async (req, res, next) => {
	const isValidStatus = isCurrentStatus(req.appeal, APPEAL_CASE_STATUS.AWAITING_TRANSFER);

	if (!isValidStatus) {
		return res.status(400).send({ errors: { appealStatus: ERROR_INVALID_APPEAL_STATE } });
	}
	next();
};
