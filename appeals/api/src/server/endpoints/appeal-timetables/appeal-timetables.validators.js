import validateDateParameter from '#common/validators/date-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { ERROR_MUST_NOT_HAVE_TIMETABLE_DATE } from '@pins/appeals/constants/support.js';
import { isExpeditedAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { composeMiddleware } from '@pins/express';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 * @param {string} value
 * @param {{ req: { appeal: Appeal}}} param1
 * @returns {Error | boolean}
 */
const validateFPATimetableDate = (value, { req }) => {
	const appealTypeKey = req.appeal?.appealType?.key || '';

	if (isExpeditedAppealType(appealTypeKey)) {
		throw new Error(stringTokenReplacement(ERROR_MUST_NOT_HAVE_TIMETABLE_DATE, [appealTypeKey]));
	}
	return true;
};

const createAppealTimetableValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validationErrorHandler
);

const patchAppealTimetableValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('appealTimetableId'),
	validateDateParameter({
		parameterName: 'ipCommentsDueDate',
		mustBeFutureDate: true,
		mustBeBusinessDay: true,
		customFn: validateFPATimetableDate
	}),
	validateDateParameter({
		parameterName: 'lpaStatementDueDate',
		mustBeFutureDate: true,
		mustBeBusinessDay: true,
		customFn: validateFPATimetableDate
	}),
	validateDateParameter({
		parameterName: 'finalCommentsDueDate',
		mustBeFutureDate: true,
		mustBeBusinessDay: true,
		customFn: validateFPATimetableDate
	}),
	validateDateParameter({
		parameterName: 'issueDeterminationDate',
		mustBeFutureDate: true,
		mustBeBusinessDay: true
	}),
	validateDateParameter({
		parameterName: 'lpaQuestionnaireDueDate',
		mustBeFutureDate: true,
		mustBeBusinessDay: true
	}),
	validateDateParameter({
		parameterName: 'statementOfCommonGroundDueDate',
		mustBeFutureDate: true,
		mustBeBusinessDay: true
	}),
	validateDateParameter({
		parameterName: 'planningObligationDueDate',
		mustBeFutureDate: true,
		mustBeBusinessDay: true
	}),
	validationErrorHandler
);

export { createAppealTimetableValidator, patchAppealTimetableValidator };
