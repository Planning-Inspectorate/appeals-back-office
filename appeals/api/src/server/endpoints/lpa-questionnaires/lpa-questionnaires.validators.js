import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	ERROR_LPA_QUESTIONNAIRE_VALID_VALIDATION_OUTCOME_REASONS_REQUIRED,
	ERROR_ONLY_FOR_INCOMPLETE_VALIDATION_OUTCOME
} from '@pins/appeals/constants/support.js';
import { isOutcomeIncomplete } from '#utils/check-validation-outcome.js';
import validateDateParameter from '#common/validators/date-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import { validateBooleanParameter } from '#common/validators/boolean-parameter.js';
import {
	validateOptionalTextAreaParameter,
	validateNullableTextAreaParameter
} from '#common/validators/string-parameter.js';
import validateIncompleteInvalidReasonParameter from '#common/validators/incomplete-invalid-reason-parameter.js';
import validateEnumParameter from '#common/validators/enum-parameter.js';
import validateNumberParameter from '#common/validators/number-parameter.js';
import validateNumberRangeParameter from '#common/validators/number-range-parameter.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { LENGTH_8000 } from '@pins/appeals/constants/support.js';

const getLPAQuestionnaireValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('lpaQuestionnaireId'),
	validationErrorHandler
);

const patchLPAQuestionnaireValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('lpaQuestionnaireId'),
	validateIncompleteInvalidReasonParameter('incompleteReasons'),
	body('validationOutcome')
		.optional()
		.isString()
		.custom((value, { req }) => {
			if (isOutcomeIncomplete(value) && !req.body.incompleteReasons) {
				throw new Error(ERROR_LPA_QUESTIONNAIRE_VALID_VALIDATION_OUTCOME_REASONS_REQUIRED);
			}

			return value;
		}),
	validateDateParameter({
		parameterName: 'lpaQuestionnaireDueDate',
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
	validateBooleanParameter('isGreenBelt').optional(),
	validateBooleanParameter('lpaCostsAppliedFor').optional(),
	validateBooleanParameter('isConservationArea').optional(),
	validateBooleanParameter('isCorrectAppealType').optional(),
	validateNullableTextAreaParameter('siteAccessDetails').optional(),
	validateNullableTextAreaParameter('siteSafetyDetails').optional(),
	validateNullableTextAreaParameter('extraConditions', LENGTH_8000).optional(),
	validateBooleanParameter('affectsScheduledMonument').optional(),
	validateBooleanParameter('hasProtectedSpecies').optional(),
	validateBooleanParameter('isAonbNationalLandscape').optional(),
	validateBooleanParameter('isGypsyOrTravellerSite').optional(),
	validateEnumParameter('lpaProcedurePreference', Object.values(APPEAL_CASE_PROCEDURE), true),
	validateOptionalTextAreaParameter('lpaProcedurePreferenceDetails').optional(),
	validateNumberParameter('lpaProcedurePreferenceDuration').optional(),
	validateNumberRangeParameter('lpaProcedurePreferenceDuration', 0, 99).optional(),
	validationErrorHandler
);

export { getLPAQuestionnaireValidator, patchLPAQuestionnaireValidator };
