import logger from '#utils/logger.js';
import { ERROR_FAILED_TO_SAVE_DATA, ERROR_NOT_FOUND } from '#endpoints/constants.js';
import { formatAppellant } from './appellants.formatter.js';
import appellantRepository from '#repositories/appellant.repository.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getAppellantById = async (req, res) => {
	const { appellant } = req.appeal;
	if (appellant) {
		const formattedAppellant = formatAppellant(appellant);
		return res.send(formattedAppellant);
	} else {
		return res.status(404).send({ errors: ERROR_NOT_FOUND });
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const updateAppellantById = async (req, res) => {
	const {
		body: { name },
		params: { appellantId }
	} = req;

	try {
		await appellantRepository.updateAppellantById(Number(appellantId), {
			name
		});
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	return res.send({ name });
};

export { getAppellantById, updateAppellantById };
