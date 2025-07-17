import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	ERROR_ONLY_FOR_INCOMPLETE_VALIDATION_OUTCOME,
	ERROR_VALID_VALIDATION_OUTCOME_REASONS_REQUIRED
} from '@pins/appeals/constants/support.js';
import { isOutcomeIncomplete, isOutcomeInvalid } from '#utils/check-validation-outcome.js';
import validateDateParameter from '#common/validators/date-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import {
	validateStringParameter,
	validateTextAreaParameter,
	validateOptionalTextAreaParameter,
	validateNullableTextAreaParameter
} from '#common/validators/string-parameter.js';
import { validateBooleanParameter } from '#common/validators/boolean-parameter.js';
import validateIncompleteInvalidReasonParameter from '#common/validators/incomplete-invalid-reason-parameter.js';
import validateEnumParameter from '#common/validators/enum-parameter.js';
import {
	APPEAL_KNOWS_OTHER_OWNERS,
	APPEAL_CASE_PROCEDURE
} from '@planning-inspectorate/data-model';
import validateNumberRangeParameter from '#common/validators/number-range-parameter.js';
import { validateNumberParameter } from '#common/validators/number-parameter.js';

/** @typedef {import('express').RequestHandler} RequestHandler */

const getAppellantCaseValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('appellantCaseId'),
	validationErrorHandler
);

const patchAppellantCaseValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateDateParameter({
		parameterName: 'appealDueDate',
		mustBeFutureDate: true,
		customFn: (
			/** @type {any} */ value,
			/** @type {{ req: { body: { validationOutcome: string } } }} */ { req }
		) => {
			if (value && !isOutcomeIncomplete(req.body.validationOutcome)) {
				throw new Error(ERROR_ONLY_FOR_INCOMPLETE_VALIDATION_OUTCOME);
			}

			return value;
		}
	}),
	validateIdParameter('appellantCaseId'),
	validateIncompleteInvalidReasonParameter('incompleteReasons'),
	validateIncompleteInvalidReasonParameter('invalidReasons'),
	body('validationOutcome')
		.optional()
		.isString()
		.custom((value, { req }) => {
			if (isOutcomeIncomplete(value) && !req.body.incompleteReasons) {
				throw new Error(ERROR_VALID_VALIDATION_OUTCOME_REASONS_REQUIRED);
			}

			if (isOutcomeInvalid(value) && !req.body.invalidReasons) {
				throw new Error(ERROR_VALID_VALIDATION_OUTCOME_REASONS_REQUIRED);
			}

			return value;
		}),
	validateStringParameter('applicantFirstName'),
	validateStringParameter('applicantSurname'),
	validateBooleanParameter('isSiteFullyOwned'),
	validateBooleanParameter('isSitePartiallyOwned'),
	validateBooleanParameter('areAllOwnersKnown'),
	validateEnumParameter('knowsOtherLandowners', Object.values(APPEAL_KNOWS_OTHER_OWNERS), true),
	validateBooleanParameter('hasAttemptedToIdentifyOwners'),
	validateBooleanParameter('hasAdvertisedAppeal'),
	validateNullableTextAreaParameter('siteAccessDetails'),
	validateNullableTextAreaParameter('siteSafetyDetails'),
	validateTextAreaParameter('developmentDescription.details'),
	validateBooleanParameter('developmentDescription.isChanged'),
	validateBooleanParameter('appellantCostsAppliedFor'),
	validateEnumParameter('appellantProcedurePreference', Object.values(APPEAL_CASE_PROCEDURE), true),
	validateOptionalTextAreaParameter('appellantProcedurePreferenceDetails').optional(),
	validateNumberParameter('appellantProcedurePreferenceDuration').optional(),
	validateNumberRangeParameter('appellantProcedurePreferenceDuration', 0, 99).optional(),
	validateNumberParameter('appellantProcedurePreferenceWitnessCount').optional(),
	validateNumberRangeParameter('appellantProcedurePreferenceWitnessCount', 0, 99).optional(),
	validationErrorHandler
);

export { getAppellantCaseValidator, patchAppellantCaseValidator };
