import { getAllAppealTypes } from '#repositories/appeal-type.repository.js';
import { currentStatus } from '#utils/current-status.js';
import { filterEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';
import { ERROR_INVALID_APPEAL_STATE, ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

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
 * @param {Request} req
 * @param {Response} _res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
export const loadEnabledAppealTypesAndAddToRequest = async (req, _res, next) => {
	const appealTypes = await getAllAppealTypes();
	const enabledAppealTypes = filterEnabledAppealTypes(appealTypes);
	req.appealTypes = enabledAppealTypes;
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
		//@ts-ignore
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
	const isValidStatus = [
		APPEAL_CASE_STATUS.AWAITING_TRANSFER,
		APPEAL_CASE_STATUS.TRANSFERRED
		//@ts-ignore
	].includes(currentStatus(req.appeal));

	if (!isValidStatus) {
		return res.status(400).send({ errors: { appealStatus: ERROR_INVALID_APPEAL_STATE } });
	}
	next();
};

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const validateAppealStatusForUpdate = async (req, res, next) => {
	const validAppealChangeTypeStatuses = [
		APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
		APPEAL_CASE_STATUS.VALIDATION
	];

	//@ts-ignore
	const status = currentStatus(req.appeal);

	//@ts-ignore
	if (!validAppealChangeTypeStatuses.includes(status)) {
		return res.status(400).send({ errors: { appealStatus: ERROR_INVALID_APPEAL_STATE } });
	}
	next();
};
