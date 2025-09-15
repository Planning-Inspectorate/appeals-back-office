import { getInterestedPartyComment } from './interested-party-comments.service.js';

/**
 * @type {import('express').RequestHandler}
 * @returns {Promise<void>}
 * */
export const validateComment = async (req, res, next) => {
	const { appealId, commentId } = req.params;

	try {
		const representation = await getInterestedPartyComment(req.apiClient, appealId, commentId);
		if (!representation || representation.representationType !== 'comment') {
			return res.status(404).render('app/404.njk');
		}

		req.currentRepresentation = representation;

		next();
	} catch (/** @type {any} */ error) {
		switch (error?.response?.statusCode) {
			case 404:
				return res.status(404).render('app/404.njk');
			default:
				return res.status(500).render('app/500.njk');
		}
	}
};
