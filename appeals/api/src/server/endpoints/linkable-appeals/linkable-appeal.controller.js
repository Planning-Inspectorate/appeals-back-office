import { canLinkAppeals } from '#endpoints/link-appeals/link-appeals.service.js';
import { getLinkableAppealSummaryByCaseReference } from './linkable-appeal.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getLinkableAppealById = async (req, res) => {
	const { appealReference, linkableType } = req.params;

	try {
		const linkableAppeal = await getLinkableAppealSummaryByCaseReference(appealReference);

		if (linkableAppeal.source === 'horizon') {
			return res.send(linkableAppeal);
		}

		if (!canLinkAppeals(linkableAppeal, linkableType, 'lead')) {
			throw 409;
		}

		return res.send(linkableAppeal);
	} catch (/** @type {*} */ statusCode) {
		return res.status(typeof statusCode === 'number' ? statusCode : 500).end();
	}
};
