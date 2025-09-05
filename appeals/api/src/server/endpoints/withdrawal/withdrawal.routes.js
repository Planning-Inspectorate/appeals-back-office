import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { postWithdrawal } from './withdrawal.controller.js';
import { getDateValidator } from './withdrawal.validator.js';

const router = createRouter();

router.post(
	'/:appealId/withdrawal',
	/*
		#swagger.tags = ['Withdrawal']
		#swagger.path = '/appeals/{appealId}/withdrawal'
		#swagger.description = Withdraws an appeal and sets appeal status to 'withdrawn'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Withdrawal request',
			schema: { $ref: '#/definitions/WithdrawalRequestRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Gets the appeal or null',
			schema: { $ref: '#/definitions/Appeal' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	getDateValidator,
	asyncHandler(postWithdrawal)
);

export { router as withdrawalRoutes };
