import { validateRequiredBooleanParameter } from '#common/validators/boolean-parameter.js';
import { validateRequiredStringParameter } from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';

const createListedBuildingValidator = composeMiddleware(
	validateRequiredStringParameter('lpaQuestionnaireId'),
	validateRequiredStringParameter('listEntry'),
	validateRequiredBooleanParameter('affectsListedBuilding'),
	validationErrorHandler
);

const updateListedBuildingValidator = composeMiddleware(
	validateRequiredStringParameter('listEntry'),
	validateRequiredBooleanParameter('affectsListedBuilding'),
	validationErrorHandler
);

const removeListedBuildingValidator = composeMiddleware(
	validateRequiredStringParameter('listedBuildingId'),
	validationErrorHandler
);

export {
	createListedBuildingValidator,
	removeListedBuildingValidator,
	updateListedBuildingValidator
};
