import { isAppealTypeEnabled } from '#utils/feature-flags-appeal-types.js';
import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {string} appealType
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<Response | void>}
 */
export const checkAppealTypeIsEnabled = (appealType) => async (_req, res, next) => {
	if (!isAppealTypeEnabled(appealType)) {
		return res.status(404).send({ errors: { caseReference: ERROR_NOT_FOUND } });
	}
	next();
};
