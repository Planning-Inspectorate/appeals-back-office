import { body, param } from 'express-validator';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';
import validateIdParameter from '#common/validators/id-parameter.js';
import validateDateParameter from '#common/validators/date-parameter.js';
import validateTimeRangeParameters from '#common/validators/time-range-parameters.js';
import {
	ERROR_INVALID_SITE_VISIT_TYPE,
	ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED,
	SITE_VISIT_TYPE_UNACCOMPANIED,
	SITE_VISIT_TYPE_ACCOMPANIED,
	SITE_VISIT_TYPE_ACCESS_REQUIRED,
	ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCOMPANIED
} from '@pins/appeals/constants/support.js';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {boolean} isRequired
 * @returns {ValidationChain}
 */
const validateSiteVisitType = (isRequired = false) => {
	const validator = body('visitType');

	if (!isRequired) {
		validator.optional();
	}

	validator.isString().withMessage(ERROR_INVALID_SITE_VISIT_TYPE);

	return validator;
};

const validateSiteVisitRequiredDateTimeFields = param('appealId').custom((value, { req }) => {
	const { visitDate, visitEndTime, visitStartTime, visitType } = req.body;

	if (visitType === SITE_VISIT_TYPE_ACCESS_REQUIRED) {
		if (visitDate || visitStartTime || visitEndTime) {
			if (!visitDate || !visitStartTime || !visitEndTime) {
				throw new Error(ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED);
			}
		}
	} else if (visitType === SITE_VISIT_TYPE_ACCOMPANIED) {
		if (visitDate || visitStartTime) {
			if (!visitDate || !visitStartTime) {
				throw new Error(ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCOMPANIED);
			}
		}
	}

	return value;
});

const getSiteVisitValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('siteVisitId'),
	validationErrorHandler
);

const postSiteVisitValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateSiteVisitRequiredDateTimeFields,
	validateSiteVisitType(true),
	validateDateParameter({ parameterName: 'visitDate' }),
	validateDateParameter({ parameterName: 'visitStartTime' }),
	validateDateParameter({ parameterName: 'visitEndTime' }),
	validateTimeRangeParameters('visitStartTime', 'visitEndTime'),
	validationErrorHandler
);

const patchSiteVisitValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('siteVisitId'),
	validateSiteVisitRequiredDateTimeFields,
	validateSiteVisitType(),
	validateDateParameter({ parameterName: 'visitDate' }),
	body('visitStartTime')
		.if(body('visitType').not().equals(SITE_VISIT_TYPE_UNACCOMPANIED))
		.custom((value, { req }) => {
			if (value) {
				return validateDateParameter({ parameterName: 'visitStartTime' })(req, {}, () => {});
			}
			return true;
		}),
	body('visitEndTime')
		.if(body('visitType').not().equals(SITE_VISIT_TYPE_UNACCOMPANIED))
		.custom((value, { req }) => {
			if (value) {
				return validateDateParameter({ parameterName: 'visitEndTime' })(req, {}, () => {});
			}
			return true;
		}),
	body(['visitStartTime', 'visitEndTime'])
		.if(body('visitType').not().equals(SITE_VISIT_TYPE_UNACCOMPANIED))
		.custom((value, { req }) => {
			if (req.body.visitStartTime && req.body.visitEndTime) {
				return validateTimeRangeParameters('visitStartTime', 'visitEndTime')(req, {}, () => {});
			}
			return true;
		}),
	validationErrorHandler
);

export { getSiteVisitValidator, patchSiteVisitValidator, postSiteVisitValidator };
