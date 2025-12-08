import { validateBooleanParameter } from '#common/validators/boolean-parameter.js';
import validateDateParameter from '#common/validators/date-parameter.js';
import validateEnumParameter from '#common/validators/enum-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import validateIncompleteInvalidReasonParameter from '#common/validators/incomplete-invalid-reason-parameter.js';
import { validateNumberParameter } from '#common/validators/number-parameter.js';
import validateNumberRangeParameter from '#common/validators/number-range-parameter.js';
import {
	validateNullableTextAreaParameter,
	validateOptionalTextAreaParameter,
	validateStringParameter,
	validateStringParameterAllowingEmpty,
	validateTextAreaParameter
} from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { isOutcomeIncomplete, isOutcomeInvalid } from '#utils/check-validation-outcome.js';
import {
	ERROR_ONLY_FOR_INCOMPLETE_VALIDATION_OUTCOME,
	ERROR_VALID_VALIDATION_OUTCOME_REASONS_REQUIRED,
	LENGTH_250,
	LENGTH_8
} from '@pins/appeals/constants/support.js';
import { composeMiddleware } from '@pins/express';
import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_KNOWS_OTHER_OWNERS
} from '@planning-inspectorate/data-model';
import { body } from 'express-validator';

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

const createContactAddressValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('appellantCaseId'),
	validateStringParameter('addressLine1', LENGTH_250),
	validateStringParameterAllowingEmpty('addressLine2', LENGTH_250),
	validateStringParameter('addressTown', LENGTH_250),
	validateStringParameter('addressCountry', LENGTH_250),
	validateStringParameterAllowingEmpty('addressCounty', LENGTH_250),
	validateStringParameter('postcode', LENGTH_8),
	validationErrorHandler
);

const updateContactAddressValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('appellantCaseId'),
	validateIdParameter('contactAddressId'),
	validateStringParameterAllowingEmpty('addressLine1', LENGTH_250),
	validateStringParameterAllowingEmpty('addressLine2', LENGTH_250),
	validateStringParameterAllowingEmpty('addressTown', LENGTH_250),
	validateStringParameterAllowingEmpty('addressCountry', LENGTH_250),
	validateStringParameterAllowingEmpty('addressCounty', LENGTH_250),
	validateStringParameterAllowingEmpty('postcode', LENGTH_8),
	validationErrorHandler
);

export {
	createContactAddressValidator,
	getAppellantCaseValidator,
	patchAppellantCaseValidator,
	updateContactAddressValidator
};
