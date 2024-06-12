import { ERROR_NOT_FOUND } from '../constants.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
const checkAddressExists = async (req, res, next) => {
	const {
		appeal,
		params: { addressId }
	} = req;
	const hasAddress = appeal.address?.id === Number(addressId);

	if (!hasAddress) {
		return res.status(404).send({ errors: { addressId: ERROR_NOT_FOUND } });
	}

	next();
};

export { checkAddressExists };
