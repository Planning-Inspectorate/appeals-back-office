import { getAppealTypeByTypeId } from '#repositories/appeal-type.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import { isAppealTypeEnabled } from '#utils/feature-flags-appeal-types.js';
import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
export const checkAppealExistsByIdAndAddToRequest = async (req, res, next) => {
	const {
		params: { appealId },
		query: { minimal }
	} = req;

	const appeal = await appealRepository.getAppealById(Number(appealId), minimal === 'true' ? null : undefined);

	if (!appeal || !isAppealTypeEnabled(appeal.appealType?.key || '')) {
		return res.status(404).send({ errors: { appealId: ERROR_NOT_FOUND } });
	}

	req.appeal = appeal;
	next();
};

/**
 * @param {string} appealIncludes
 * @returns {import('#repositories/appeal.repository.js').AppealIncludes}
 */
const parseIncludes = (appealIncludes) => {
	/** @type {import('#repositories/appeal.repository.js').AppealIncludes} */
	let result = {};

	appealIncludes.split(',').forEach(item => {
		result[item] = true;
	});

	return result;
};

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
export const checkAppealExistsByCaseReferenceAndAddToRequest = async (req, res, next) => {
	const {
		params: { caseReference }
	} = req;

	const appeal = await appealRepository.getAppealByAppealReference(caseReference);

	if (!appeal || !isAppealTypeEnabled(appeal.appealType?.key || '')) {
		return res.status(404).send({ errors: { caseReference: ERROR_NOT_FOUND } });
	}

	req.appeal = appeal;
	next();
};

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
export const checkAppealExistsById = async (req, res, next) => {
	const {
		params: { appealId }
	} = req;

	const appeal = await appealRepository.getAppealById(Number(appealId), null);
	const appealType = appeal?.appealType?.key
		? appeal?.appealType?.key
		: (await getAppealTypeByTypeId(Number(appeal?.appealTypeId)))?.key;

	if (!appeal || !isAppealTypeEnabled(appealType || '')) {
		return res.status(404).send({ errors: { appealId: ERROR_NOT_FOUND } });
	}

	next();
};
