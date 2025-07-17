import { lpaService } from './local-planning-authorities.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const changeLpa = async (req, res) => {
	const { appeal } = req;
	const { newLpaId } = req.body;
	const azureAdUserId = req.get('azureAdUserId');

	await lpaService.changeLpa(appeal, Number(newLpaId), azureAdUserId);

	return res.send(true);
};

export const controller = {
	changeLpa
};
