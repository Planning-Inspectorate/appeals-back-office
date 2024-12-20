import BackOfficeAppError from '#utils/app-error.js';
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
		throw new BackOfficeAppError(
			`Address with ID ${addressId} does not exist on appeal with ID ${appeal.id}`,
			404,
			{ addressId: ERROR_NOT_FOUND }
		);
	}

	next();
};

export { checkAddressExists };
