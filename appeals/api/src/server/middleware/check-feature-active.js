import { isFeatureActive } from '#utils/feature-flags.js';
import { ERROR_FEATURE_NOT_ACTIVE } from '@pins/appeals/constants/support.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {string} featureFlag
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<Response | void>}
 */
export const checkFeatureActive = (featureFlag) => async (_req, res, next) => {
	if (!isFeatureActive(featureFlag)) {
		return res.status(404).send({ errors: ERROR_FEATURE_NOT_ACTIVE });
	}
	next();
};
