import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { requestChangeOfProcedureType } from './change-procedure-type.controller.js';
import { postChangeProcedureTypeValidator } from './change-procedure-type.validator.js';

const router = createRouter();

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
	postChangeProcedureTypeValidator,
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(requestChangeOfProcedureType)
);

export { router as changeProcedureTypeRoutes };
