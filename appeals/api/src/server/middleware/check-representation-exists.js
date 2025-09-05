import representationRepository from '#repositories/representation.repository.js';
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
export const checkRepresentationExistsById = async (req, res, next) => {
	const {
		params: { repId }
	} = req;

	const representation = await representationRepository.getById(Number(repId));

	if (!representation) {
		return res.status(404).send({ errors: { repId: ERROR_NOT_FOUND } });
	}

	next();
};
