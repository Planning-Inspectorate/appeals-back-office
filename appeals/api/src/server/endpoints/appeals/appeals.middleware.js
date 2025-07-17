import {
	ERROR_MUST_BE_BOOLEAN,
	ERROR_MUST_BE_VALID_APPEAL_STATE
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const validateHasInspector = async (req, res, next) => {
	const hasInspector = req.query.hasInspector;

	if (hasInspector !== undefined && hasInspector !== 'true' && hasInspector !== 'false') {
		return res.status(400).send({ errors: { hasInspector: ERROR_MUST_BE_BOOLEAN } });
	}

	next();
};

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const validateAppealStatus = async (req, res, next) => {
	const status = req.query.status;
	const validStatuses = [
		APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
		APPEAL_CASE_STATUS.VALIDATION,
		APPEAL_CASE_STATUS.READY_TO_START,
		APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
		APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
		APPEAL_CASE_STATUS.COMPLETE,
		APPEAL_CASE_STATUS.INVALID,
		APPEAL_CASE_STATUS.WITHDRAWN,
		APPEAL_CASE_STATUS.CLOSED,
		APPEAL_CASE_STATUS.AWAITING_TRANSFER,
		APPEAL_CASE_STATUS.TRANSFERRED,
		APPEAL_CASE_STATUS.EVENT,
		APPEAL_CASE_STATUS.AWAITING_EVENT,
		//S78
		APPEAL_CASE_STATUS.FINAL_COMMENTS,
		APPEAL_CASE_STATUS.STATEMENTS
	];

	const isValidStatus = typeof status === 'string' ? validStatuses.includes(status) : !status;

	if (!isValidStatus) {
		return res.status(400).send({ errors: { status: ERROR_MUST_BE_VALID_APPEAL_STATE } });
	}
	next();
};
