import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { getAppealValidator } from '#endpoints/appeals/appeals.validators.js';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import * as controller from './casenotes.controller.js';

const router = createRouter();

router.get(
	'/:appealId/casenotes',
	/*
	#swagger.tags = ['Casenotes']
	#swagger.path = '/appeals/{appealId}/casenotes'
	#swagger.description = Returns all the casenotes for an appeal
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.responses[200] = {
		description: 'returns an array of comments',
		schema: { $ref: '#/components/schemas/GetCasenotesResponse' }
	}
	#swagger.responses[400] = {}
	#swagger.responses[404] = {}
 */
	getAppealValidator,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(controller.getAllCasenotesByAppealId)
);

router.get(
	'/:appealId/casenotes/:casenoteId',
	/*
	#swagger.tags = ['Casenotes']
	#swagger.path = '/appeals/{appealId}/casenotes/{casenoteId}'
	#swagger.description = Returns a casenote for an appeal by id
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.responses[200] = {
		description: 'Returns a comment by casenoteId',
		schema: { $ref: '#/components/schemas/GetCasenoteResponse' }
	}
	#swagger.responses[400] = {}
	#swagger.responses[404] = {}
 */
	getAppealValidator,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(controller.getCasenoteByCasenoteId)
);

router.post(
	'/:appealId/casenotes',
	/*
	#swagger.tags = ['Casenotes']
	#swagger.path = '/appeals/{appealId}/casenotes'
	#swagger.description = Post a casenote for an appeal
	#swagger.parameters['azureAdUserId'] = {
		in: 'header',
		required: true,
		example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
	}
	#swagger.requestBody = {
		in: 'body',
		description: 'A comment',
		schema: { $ref: '#/components/schemas/CreateCasenoteRequest' },
		required: true
	}
	#swagger.responses[200] = {
		description: 'Returns the comment',
		schema: { $ref: '#/components/schemas/GetCasenoteResponse' }
	}
	#swagger.responses[400] = {}
	#swagger.responses[404] = {}
 */
	getAppealValidator,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(controller.postAppealCasenote)
);

export { router as casenotesRoutes }
