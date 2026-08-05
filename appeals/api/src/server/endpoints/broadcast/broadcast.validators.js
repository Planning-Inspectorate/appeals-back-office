import validateIdParameter from '#common/validators/id-parameter.js';
import { validateRequiredNumberParameter } from '#common/validators/number-parameter.js';
import { validateRequiredStringParameter } from '#common/validators/string-parameter.js';
import validateUuidParameter from '#common/validators/uuid-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {string} parameterName
 * @returns {ValidationChain}
 */
const validateRequiredBroadcastType = (parameterName) =>
	body(parameterName)
		.isIn(['Create', 'Update', 'Delete'])
		.withMessage('must be one of Create, Update or Delete');

export const broadcastAppealValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validationErrorHandler
);

export const broadcastDocumentValidator = composeMiddleware(
	validateUuidParameter({ parameterName: 'documentGuid' }),
	validateRequiredNumberParameter('version'),
	validateRequiredBroadcastType('updateType'),
	validationErrorHandler
);

export const broadcastRepresentationValidator = composeMiddleware(
	validateIdParameter('representationId'),
	validateRequiredBroadcastType('updateType'),
	validationErrorHandler
);

export const broadcastServiceUserValidator = composeMiddleware(
	validateIdParameter('serviceUserId'),
	validateRequiredBroadcastType('updateType'),
	validateRequiredStringParameter('roleName'),
	validateRequiredStringParameter('caseReference'),
	validationErrorHandler
);
