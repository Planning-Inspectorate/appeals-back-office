import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	ERROR_LPA_QUESTIONNAIRE_VALID_VALIDATION_OUTCOME_REASONS_REQUIRED,
	ERROR_ONLY_FOR_INCOMPLETE_VALIDATION_OUTCOME
} from '../constants.js';
import { isOutcomeIncomplete } from '#utils/check-validation-outcome.js';
import validateDateParameter from '#common/validators/date-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import { validateBooleanParameter } from '#common/validators/boolean-parameter.js';
import validateBooleanWithConditionalStringParameters from '#common/validators/boolean-with-conditional-string-parameters.js';
import validateIncompleteInvalidReasonParameter from '#common/validators/incomplete-invalid-reason-parameter.js';

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
	validateBooleanParameter('siteWithinGreenBelt'),
	validateBooleanParameter('lpaCostsAppliedFor'),
	validateBooleanParameter('isConservationArea'),
	validateBooleanParameter('isCorrectAppealType'),
	validateBooleanWithConditionalStringParameters(
		'doesSiteHaveHealthAndSafetyIssues',
		'healthAndSafetyDetails',
		true
	),
	validateBooleanWithConditionalStringParameters(
		'doesSiteRequireInspectorAccess',
		'inspectorAccessDetails',
		true
	),
	validationErrorHandler
);

export { getLPAQuestionnaireValidator, patchLPAQuestionnaireValidator };
