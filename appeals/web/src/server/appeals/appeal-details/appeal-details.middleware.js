import { getAppealDetailsFromId } from './appeal-details.service.js';

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<void>}
 */
export const validateAppeal = async (req, res, next) => {
	const { appealId, caseId } = req.params;

	try {
		const appeal = await getAppealDetailsFromId(req.apiClient, appealId || caseId);
		if (!appeal) {
			return res.status(404).render('app/404.njk');
		}
		req.currentAppeal = appeal;
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
