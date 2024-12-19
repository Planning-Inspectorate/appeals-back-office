import { getSingularRepresentationByType } from './representations.service.js';

/**
 * @param {string} type
 * @returns {import('express').RequestHandler}
 */
export const withSingularRepresentation = (type) => async (req, res, next) => {
	const { appealId } = req.params;

	try {
		const representation = await getSingularRepresentationByType(req.apiClient, appealId, type);

		if (!representation) {
			return res.status(404).render('app/404.njk');
		}

		req.currentRepresentation = representation;
	} catch (/** @type {any} */ error) {
		return res.status(500).render('app/500.njk');
	}

	next();
};
