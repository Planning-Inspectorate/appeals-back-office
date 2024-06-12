import { composeMiddleware } from '@pins/express';
import { validationErrorHandler } from '#middleware/error-handler.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import validateDateParameter from '#common/validators/date-parameter.js';
import isFPA from '#utils/is-fpa.js';
import { ERROR_MUST_NOT_HAVE_TIMETABLE_DATE } from '#endpoints/constants.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 * @param {string} value
 * @param {{ req: { appeal: Appeal}}} param1
 * @returns {Error | boolean}
 */
const validateFPATimetableDate = (value, { req }) => {
	if (!isFPA(req.appeal.appealType.key)) {
		throw new Error(
			stringTokenReplacement(ERROR_MUST_NOT_HAVE_TIMETABLE_DATE, [req.appeal.appealType.key])
		);
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
		parameterName: 'finalCommentReviewDate',
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
		parameterName: 'statementReviewDate',
		mustBeFutureDate: true,
		mustBeBusinessDay: true,
		customFn: validateFPATimetableDate
	}),
	validationErrorHandler
);

export { createAppealTimetableValidator, patchAppealTimetableValidator };
