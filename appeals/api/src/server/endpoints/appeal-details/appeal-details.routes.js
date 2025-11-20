import {
	checkAppealExistsByCaseReferenceAndAddToRequest,
	checkAppealExistsByIdAndAddPartialToRequest
} from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { controller } from './appeal-details.controller.js';
import {
	getAppealRefValidator,
	getAppealValidator,
	patchAppealValidator
} from './appeal-details.validators.js';

const router = createRouter();

router.get(
	'/:appealId',
	/*
		#swagger.tags = ['Appeal Details']
		#swagger.path = '/appeals/{appealId}'
		#swagger.description = Gets a single appeal by ID
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Gets a single appeal by ID',
			schema: { $ref: '#/components/schemas/Appeal' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAppealValidator,
	asyncHandler(checkAppealExistsByIdAndAddPartialToRequest([])),
	asyncHandler(controller.getAppeal)
);

router.get(
	'/case-reference/:caseReference',
	/*
		#swagger.tags = ['Appeal Details']
		#swagger.path = '/appeals/case-reference/{caseReference}'
		#swagger.description = Gets a single appeal by case reference
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Gets a single appeal by id',
			schema: { $ref: '#/components/schemas/SingleAppealResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	getAppealRefValidator,
	asyncHandler(checkAppealExistsByCaseReferenceAndAddToRequest),
	asyncHandler(controller.getAppeal)
);

router.patch(
	'/:appealId',
	/*
		#swagger.tags = ['Appeal Details']
		#swagger.path = '/appeals/{appealId}'
		#swagger.description = 'Updates case team members for a single appeal'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: false,
			type: 'string',
			nullable: true
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal details to update',
			schema: { $ref: '#/components/schemas/UpdateCaseTeamRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Updates a single appeal by id',
			schema: { $ref: '#/components/schemas/UpdateCaseTeamResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	patchAppealValidator,
	asyncHandler(checkAppealExistsByIdAndAddPartialToRequest([])),
	asyncHandler(controller.updateAppealById)
);

export default router;
