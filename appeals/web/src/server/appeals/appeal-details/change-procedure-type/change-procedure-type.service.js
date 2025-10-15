import { getAppellantCaseFromAppealId } from '#appeals/appeal-details/appellant-case/appellant-case.service.js';

/**
/**
 * @param {import('@pins/express/types/express.js').Request} req
 */
export const addAppellantCaseToLocals = async (req) => {
	return getAppellantCaseFromAppealId(
		req.apiClient,
		req.currentAppeal.appealId,
		req.currentAppeal.appellantCaseId
	);
};
