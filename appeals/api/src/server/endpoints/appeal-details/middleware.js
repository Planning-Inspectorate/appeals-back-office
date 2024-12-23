import { ERROR_NOT_FOUND } from '#endpoints/constants.js';
import appealRepository from '#repositories/appeal.repository.js';
import { isAppealTypeEnabled } from '#utils/feature-flags-appeal-types.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
export const loadAppeal = async (req, res, next) => {
	const {
		params: { appealId }
	} = req;

	const appeal = await appealRepository.getAppealById(Number(appealId));

	if (!appeal || !isAppealTypeEnabled(appeal.appealType?.key || '')) {
		return res.status(404).send({
			errors: {
				appealId: ERROR_NOT_FOUND
			}
		});
	}

	req.appeal = appeal;
	next();
};
