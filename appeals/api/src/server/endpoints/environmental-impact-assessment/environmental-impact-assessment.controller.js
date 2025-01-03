/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

import { updateEiaScreeningRequirement } from '#endpoints/environmental-impact-assessment/environmental-impact-assessment.service.js';

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const patchEiaScreeningRequired = async (req, res) => {
	const { appeal } = req;

	const eiaScreeningRequired = await updateEiaScreeningRequirement(
		appeal.id,
		req.body.eiaScreeningRequired
	);

	return res.send(eiaScreeningRequired);
};
