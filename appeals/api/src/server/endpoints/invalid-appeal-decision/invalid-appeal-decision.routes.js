import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { postInvalidDecision } from './invalid-appeal-decision.controller.js';
import { getInvalidDecisionReasonValidator } from './invalid-appeal-decision.validator.js';

const router = createRouter();

router.post(
	'/:appealId/inspector-decision-invalid',
	/*
		#swagger.tags = ['Inspector Decision']
		#swagger.path = '/appeals/{appealId}/inspector-decision-invalid'
		#swagger.description = Closes an appeal by setting the inspector decision as Invalid
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Invalid decision info',
			schema: { $ref: '#/components/schemas/InvalidDecisionInfo' },
			required: true
		}
		#swagger.responses[201] = {
			description: 'Gets the Invalid decision info or null',
			schema: { $ref: '#/components/schemas/InvalidDecisionInfo' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	getInvalidDecisionReasonValidator,
	asyncHandler(postInvalidDecision)
);

export { router as invalidAppealDecisionRoutes };
