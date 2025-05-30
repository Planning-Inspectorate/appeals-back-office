import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { getAppellantCaseById, updateAppellantCaseById } from './appellant-cases.controller.js';
import checkLookupValueIsValidAndAddToRequest from '#middleware/check-lookup-value-is-valid-and-add-to-request.js';
import checkLookupValuesAreValid from '#middleware/check-lookup-values-are-valid.js';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { checkAppellantCaseExists } from './appellant-cases.service.js';
import {
	getAppellantCaseValidator,
	patchAppellantCaseValidator
} from './appellant-cases.validators.js';
import { ERROR_INVALID_APPELLANT_CASE_VALIDATION_OUTCOME } from '@pins/appeals/constants/support.js';

const router = createRouter();

router.get(
	'/:appealId/appellant-cases/:appellantCaseId',
	/*
		#swagger.tags = ['Appellant Cases']
		#swagger.path = '/appeals/{appealId}/appellant-cases/{appellantCaseId}'
		#swagger.description = Gets a single appellant case for an appeal by id
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Gets a single appellant case for an appeal by id',
			schema: { $ref: '#/components/schemas/SingleAppellantCaseResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAppellantCaseValidator,
	checkAppealExistsByIdAndAddToRequest,
	checkAppellantCaseExists,
	asyncHandler(getAppellantCaseById)
);

router.patch(
	'/:appealId/appellant-cases/:appellantCaseId',
	/*
		#swagger.tags = ['Appellant Cases']
		#swagger.path = '/appeals/{appealId}/appellant-cases/{appellantCaseId}'
		#swagger.description = Updates a single appellant case for an appeal by id
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appellant case details to update',
			schema: { $ref: '#/components/schemas/UpdateAppellantCaseRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Updates a single appeal by id',
			schema: { $ref: '#/components/schemas/UpdateAppellantCaseResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	patchAppellantCaseValidator,
	checkAppealExistsByIdAndAddToRequest,
	checkAppellantCaseExists,
	checkLookupValueIsValidAndAddToRequest(
		'validationOutcome',
		'appellantCaseValidationOutcome',
		ERROR_INVALID_APPELLANT_CASE_VALIDATION_OUTCOME
	),
	checkLookupValuesAreValid('incompleteReasons', 'appellantCaseIncompleteReason'),
	checkLookupValuesAreValid('invalidReasons', 'appellantCaseInvalidReason'),
	asyncHandler(updateAppellantCaseById)
);

export { router as appellantCasesRoutes };
