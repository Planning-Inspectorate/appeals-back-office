import { getAppealTypes } from '#endpoints/change-appeal-type/change-appeal-type.controller.js';
import { loadAllAppealTypesAndAddToRequest } from '#endpoints/change-appeal-type/change-appeal-type.middleware.js';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';

const router = createRouter();

router.get(
	'/:appealId/change-procedure-type',
	/*
		#swagger.tags = ['Appeal Type Change Request']
		#swagger.path = '/appeals/{appealId}/appeal-types'
		#swagger.description = 'Gets the list of procedure types'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'List of procedure types',
			schema: { $ref: '#/components/schemas/AppealTypes' },
		}
		#swagger.responses[400] = {}
	 */
	loadAllAppealTypesAndAddToRequest, //change to procedure
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(getAppealTypes)
);

router.post(
	'/:appealId/procedure-type-change-request',
	/*
		#swagger.tags = ['Appeal Procedure Change Request']
		#swagger.path = '/appeals/{appealId}/appeal-procedure-change-request'
		#swagger.description = 'Records a request to change the appeal procedure type'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal procedure change request',
			schema: { $ref: '#/components/schemas/AppealProcedureChangeRequest' },
			required: true
		}
		#swagger.responses[400] = {}
	 */
	checkAppealExistsByIdAndAddToRequest
	// asyncHandler(requestChangeOfProcedureType)
);

export { router as changeProcedureTypeRoutes };
