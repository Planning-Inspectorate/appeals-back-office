import commonRepository from '#repositories/common.repository.js';
import { ERROR_FAILED_TO_GET_DATA, ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import logger from '../../utils/logger.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
export const checkLpaIdExists = async (req, res, next) => {
	try {
		const { newLpaId } = req.body;
		const allLpas = await commonRepository.getLookupList('lPA');
		const lpaIds = allLpas.map((lpa) => lpa.id);
		const match = lpaIds.findIndex((id) => id === Number(newLpaId)) > -1;
		if (!match) {
			return res.status(400).send({ errors: { newAppealTypeId: ERROR_NOT_FOUND } });
		}
		next();
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: ERROR_FAILED_TO_GET_DATA });
	}
};
