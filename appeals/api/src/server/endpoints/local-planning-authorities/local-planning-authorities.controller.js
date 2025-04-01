import { lpaService } from './local-planning-authorities.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getLpa = async (req, res) => {
	const lpaId = Number(req.appeal.lpaId);

	const result = await lpaService.getLpa(lpaId);

	if (!result) {
		return res.status(404).end();
	}

	return res.send(result);
};

export const controller = {
	getLpa
};
