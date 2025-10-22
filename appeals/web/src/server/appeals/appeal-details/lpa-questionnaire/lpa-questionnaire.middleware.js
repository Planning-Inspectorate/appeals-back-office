import { areIdParamsValid } from '#lib/validators/id-param.validator.js';

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<void>}
 */
export const validateLpaQuestionnaireId = async (req, res, next) => {
	const { lpaQuestionnaireId } = req.params;
	if (!areIdParamsValid(lpaQuestionnaireId)) {
		return res.status(400).render('app/400.njk');
	}

	next();
};
