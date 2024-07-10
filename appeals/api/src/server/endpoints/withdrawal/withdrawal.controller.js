import { publishWithdrawal } from './withdrawal.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const postWithdrawal = async (req, res) => {
	const { appeal } = req;
	const { withdrawalRequestDate } = req.body;

	const decision = await publishWithdrawal(
		appeal,
		withdrawalRequestDate,
		req.get('azureAdUserId') || ''
	);

	return res.send(decision);
};
