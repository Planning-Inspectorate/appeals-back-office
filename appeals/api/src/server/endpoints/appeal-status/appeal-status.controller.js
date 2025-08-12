import appealStatusRepository from '#repositories/appeal-status.repository.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response|undefined>}
 */
export const rollBackAppealStatus = async (req, res) => {
	const { appealId } = req.params;
	const { status } = req.body;

	try {
		const appealStatus = await appealStatusRepository.rollBackAppealStatusTo(
			Number(appealId),
			status
		);
		return res.status(200).json(appealStatus);
	} catch (error) {
		if (error instanceof Error) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Failed to roll back appeal status' });
	}
};
