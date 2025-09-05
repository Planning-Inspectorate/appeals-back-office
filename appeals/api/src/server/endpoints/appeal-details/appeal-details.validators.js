import { validateBooleanParameter } from '#common/validators/boolean-parameter.js';
import validateDateParameter from '#common/validators/date-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import { validateStringParameter } from '#common/validators/string-parameter.js';
import validateUuidParameter from '#common/validators/uuid-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';

export const getAppealValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validationErrorHandler
);

export const getAppealRefValidator = composeMiddleware(
	validateStringParameter('caseReference'),
	validationErrorHandler
);

export const patchAppealValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateDateParameter({ parameterName: 'startedAt' }),
	validateDateParameter({ parameterName: 'validAt', mustBeNotBeFutureDate: true }),
	validateStringParameter('planningApplicationReference'),
	validateUuidParameter({
		parameterName: 'caseOfficer',
		parameterType: body,
		isRequired: false,
		allowNull: true
	}),
	validateBooleanParameter('isGreenBelt'),
	validateUuidParameter({
		parameterName: 'inspector',
		parameterType: body,
		isRequired: false,
		allowNull: true
	}),
	validationErrorHandler
);
