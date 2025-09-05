import config from '#environment/config.js';
import appealTypeChangeOldRouter from './change-appeal-type-old/change-appeal-type.router.js';
import appealTypeChangeRouter from './change-appeal-type/change-appeal-type.router.js';

/**
 * @type {import("express").RequestHandler}
 * @returns {void}
 */
const changeAppealTypeMiddleware = (req, res, next) => {
	// Enables building correct snapshots for tests
	const overrideFeatureFlagForTests =
		process.env.NODE_ENV === 'test' && req.headers['appeal-change-type'] === 'true';

	if (overrideFeatureFlagForTests) {
		appealTypeChangeOldRouter(req, res, next);
	} else {
		config.featureFlags.featureFlagChangeAppealType
			? appealTypeChangeRouter(req, res, next)
			: appealTypeChangeOldRouter(req, res, next);
	}
};

export default changeAppealTypeMiddleware;
