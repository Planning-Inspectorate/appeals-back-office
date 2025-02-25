import { getLinkableAppealSummaryByCaseReference } from './linkable-appeal.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getLinkableAppealById = async (req, res) => {
	const { appealReference } = req.params;
	try {
		const response = await getLinkableAppealSummaryByCaseReference(appealReference);
		return res.send(response);
	} catch (error) {
		return res.status(error === 404 ? 404 : 500).end();
	}
};
