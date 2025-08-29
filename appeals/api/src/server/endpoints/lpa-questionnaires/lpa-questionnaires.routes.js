import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import checkLookupValueIsValidAndAddToRequest from '#middleware/check-lookup-value-is-valid-and-add-to-request.js';
import checkLookupValuesAreValid from '#middleware/check-lookup-values-are-valid.js';
import { ERROR_INVALID_LPA_QUESTIONNAIRE_VALIDATION_OUTCOME } from '@pins/appeals/constants/support.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	getLpaQuestionnaireById,
	updateLPAQuestionnaireById
} from './lpa-questionnaires.controller.js';
import { checkLPAQuestionnaireExists } from './lpa-questionnaires.service.js';
import {
	getLPAQuestionnaireValidator,
	patchLPAQuestionnaireValidator
} from './lpa-questionnaires.validators.js';

const router = createRouter();

router.get(
	'/:appealId/lpa-questionnaires/:lpaQuestionnaireId',
	/*
		#swagger.tags = ['LPA Questionnaires']
		#swagger.path = '/appeals/{appealId}/lpa-questionnaires/{lpaQuestionnaireId}'
		#swagger.description = Gets a single LPA questionnaire for an appeal by id
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Gets a single LPA questionnaire for an appeal by id',
			schema: { $ref: '#/components/schemas/SingleLPAQuestionnaireResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getLPAQuestionnaireValidator,
	asyncHandler(checkAppealExistsByIdAndAddToRequest),
	checkLPAQuestionnaireExists,
	asyncHandler(getLpaQuestionnaireById)
);

router.patch(
	'/:appealId/lpa-questionnaires/:lpaQuestionnaireId',
	/*
		#swagger.tags = ['LPA Questionnaires']
		#swagger.path = '/appeals/{appealId}/lpa-questionnaires/{lpaQuestionnaireId}'
		#swagger.description = Updates a single LPA questionnaire for an appeal by id
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'LPA questionnaire details to update',
			schema: { $ref: '#/components/schemas/UpdateLPAQuestionnaireRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Updates a single LPA questionnaire by id',
			schema: { $ref: '#/components/schemas/UpdateLPAQuestionnaireResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	patchLPAQuestionnaireValidator,
	asyncHandler(checkAppealExistsByIdAndAddToRequest),
	checkLPAQuestionnaireExists,
	checkLookupValueIsValidAndAddToRequest(
		'validationOutcome',
		'lPAQuestionnaireValidationOutcome',
		ERROR_INVALID_LPA_QUESTIONNAIRE_VALIDATION_OUTCOME
	),
	checkLookupValuesAreValid('incompleteReasons', 'lPAQuestionnaireIncompleteReason'),
	asyncHandler(updateLPAQuestionnaireById)
);

export { router as lpaQuestionnairesRoutes };
