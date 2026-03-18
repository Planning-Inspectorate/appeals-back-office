import { checkAppealExistsByIdAndAddPartialToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { handleValidationError } from '#middleware/handle-validation-error.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { postCancelEnforcementNoticeWithdrawn } from './cancel.controller.js';
import * as validators from './cancel.validators.js';

const router = createRouter({ mergeParams: true });

router.post(
	'/:appealId/cancel/enforcement-notice-withdrawn',
	/*
		#swagger.tags = ['Cancel Appeal']
		#swagger.path = '/appeals/{appealId}/cancel/enforcement-notice-withdrawn'
		#swagger.description = Cancels an appeal because the LPA has withdrawn the enforcement notice
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.parameters['dryRun'] = {
			in: 'query',
			type: 'boolean',
			description: 'If true, does not update the appeal and only returns the notify previews.',
			required: false,
			example: true
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Cancel enforcement notice withdrawal request',
			schema: { $ref: '#/definitions/CancelEnforcementNoticeWithdrawalRequest' },
			required: true
		}
		#swagger.responses[200] = {
			description: 'Returns the notify previews if this is a dry run',
			schema: { $ref: '#/definitions/CancelEnforcementNoticeWithdrawalResponse' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	checkAppealExistsByIdAndAddPartialToRequest([
		'address',
		'agent',
		'appellant',
		'lpa',
		'appealType',
		'procedureType',
		'appealRule6Parties',
		'appellantCase'
	]),
	validators.validateDryRunQueryParam,
	handleValidationError,
	asyncHandler(postCancelEnforcementNoticeWithdrawn)
);

export { router as cancelRoutes };
