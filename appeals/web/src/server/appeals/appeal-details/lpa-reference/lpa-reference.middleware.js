import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { permissionNames } from '#environment/permissions.js';
import { userHasPermission } from '#lib/mappers/index.js';
/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}§
 */
export const ensureBeforeLpaq = async (req, res, next) => {
	if (
		!userHasPermission(permissionNames.updateCase, req.session) ||
		req.currentAppeal.lpaQuestionnaireId ||
		req.currentAppeal.appealStatus === APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
	) {
		return res.status(403).render('app/403.njk');
	}
	next();
};
