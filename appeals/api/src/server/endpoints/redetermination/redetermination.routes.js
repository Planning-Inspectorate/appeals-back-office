import validateIdParameter from '#common/validators/id-parameter.js';
import { checkAppealExistsByIdAndAddPartialToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { postRedetermine } from './redetermination.controller.js';

const router = createRouter();

router.post(
	'/:appealId/redetermine',
	/*
		#swagger.tags = ['Redetermination']
		#swagger.path = '/appeals/{appealId}/redetermine'
		#swagger.description = Reopens a completed appeal for redetermination and moves to event status
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'Appeal reopened and moved to event status',
			schema: { $ref: '#/definitions/Appeal' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	*/
	validateIdParameter('appealId'),
	validationErrorHandler,
	checkAppealExistsByIdAndAddPartialToRequest(['appealStatus']),
	asyncHandler(postRedetermine)
);

export { router as redeterminationRoutes };
