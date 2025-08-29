import commonRepository from '#repositories/common.repository.js';
import representationRejectionReasonRepository from '#repositories/representation-rejection-reason.repository.js';
import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const getRejectionReasons = async (req, res) => {
	const { query } = req;

	const representationType = query.type ? String(query.type) : null;

	try {
		const reasons = representationType
			? await representationRejectionReasonRepository.getAllByType(representationType)
			: await commonRepository.getLookupList('representationRejectionReason');

		if (reasons.length === 0) {
			return res.status(404).send({ errors: ERROR_NOT_FOUND });
		}

		return res.send(reasons);
	} catch (/** @type {*} */ err) {
		return res.status(500).send({ errors: err.message });
	}
};
