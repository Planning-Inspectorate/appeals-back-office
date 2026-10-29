import { redetermineAppeal } from './redetermination.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const postRedetermine = async (req, res) => {
	const appealId = Number(req.params.appealId);
	const azureAdUserId = String(req.get('azureAdUserId') || '');

	const result = await redetermineAppeal(appealId, azureAdUserId);

	return res.status(200).send(result);
};
