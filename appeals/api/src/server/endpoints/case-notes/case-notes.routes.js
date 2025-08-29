import { getAppealValidator } from '#endpoints/appeal-details/appeal-details.validators.js';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './case-notes.controller.js';
import { postCaseNoteValidator } from './case-notes.validators.js';

const router = createRouter();

router.get(
	'/:appealId/case-notes',
	/*
	#swagger.tags = ['Case notes']
	#swagger.path = '/appeals/{appealId}/case-notes'
	#swagger.description = Returns all the case notes for an appeal
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.responses[200] = {
		description: 'returns an array of case notes',
		schema: { $ref: '#/components/schemas/GetCaseNotesResponse' }
	}
	#swagger.responses[400] = {}
	#swagger.responses[404] = {}
 */
	getAppealValidator,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(controller.getAllCaseNotesByAppealId)
);

router.post(
	'/:appealId/case-notes',
	/*
	#swagger.tags = ['Case notes']
	#swagger.path = '/appeals/{appealId}/case-notes'
	#swagger.description = Post a case note for an appeal
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.requestBody = {
		in: 'body',
		description: 'A comment',
		schema: { $ref: '#/components/schemas/CreateCaseNoteRequest' },
		required: true
	}
	#swagger.responses[201] = {
		description: 'Returns the comment',
		schema: { $ref: '#/components/schemas/GetCaseNoteResponse' }
	}
	#swagger.responses[400] = {}
	#swagger.responses[404] = {}
 */
	getAppealValidator,
	postCaseNoteValidator,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(controller.postAppealCaseNote)
);

export { router as caseNotesRoutes };
