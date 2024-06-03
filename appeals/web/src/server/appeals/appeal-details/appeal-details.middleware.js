import { getAppealDetailsFromId } from './appeal-details.service.js';

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<void>}
 */
export const validateAppeal = async (req, res, next) => {
	const { appealId } = req.params;

	try {
		const appeal = await getAppealDetailsFromId(req.apiClient, appealId);
		if (!appeal) {
			console.log('validateAppeal 404');
			return res.status(404).render('app/404');
		}
		req.currentAppeal = appeal;
		next();
	} catch (/** @type {any} */ error) {
		switch (error?.response?.statusCode) {
			case 404:
				console.log('validateAppeal caught 404:');
				console.log(error);
				return res.status(404).render('app/404');
			default:
				console.log('validateAppeal caught 500:');
				console.log(error);
				return res.status(500).render('app/500');
		}
	}
};
