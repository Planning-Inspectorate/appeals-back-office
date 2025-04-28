import logger from '#utils/logger.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';
import { formatHearing } from './hearing.formatter.js';
import { createHearing, updateHearing } from './hearing.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getHearingById = async (req, res) => {
	const { appeal } = req;
	const formattedAppeal = formatHearing(appeal);

	console.log('formattedAppeal', formattedAppeal);

	return res.send(formattedAppeal);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const postHearing = async (req, res) => {
	const {
		body: { hearingStartTime, hearingEndTime, address },
		params
	} = req;

	const appealId = Number(params.appealId);

	try {
		await createHearing({ appealId, hearingStartTime, hearingEndTime, address });
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	return res.status(201).send({ appealId, hearingStartTime, hearingEndTime });
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const rearrangeHearing = async (req, res) => {
	const {
		body: { hearingStartTime, hearingEndTime, address, addressId },
		params
	} = req;

	const appealId = Number(params.appealId);
	const hearingId = Number(params.hearingId);

	try {
		await updateHearing({
			appealId,
			hearingId,
			hearingStartTime,
			hearingEndTime,
			address,
			addressId: Number(addressId)
		});
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	return res.status(201).send({ appealId, hearingStartTime, hearingEndTime });
};
