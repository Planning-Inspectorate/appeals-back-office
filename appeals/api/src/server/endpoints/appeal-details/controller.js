import { service } from './service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getAppeal = async (req, res) => {
	const { appeal } = req;

	const dto = await service.loadAndFormatAppeal({ appeal });

	return res.send(dto);
};

export const controller = {
	getAppeal
};
