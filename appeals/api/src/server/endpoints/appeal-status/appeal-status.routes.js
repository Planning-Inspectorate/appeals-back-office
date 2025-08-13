import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './appeal-status.controller.js';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { validateAppealStatusRollBackRequest } from './appeal-status.validators.js';

const router = createRouter();

router.post(
	'/:appealId/appeal-status/roll-back',
	/*
        #swagger.tags = ['Appeal Status']
        #swagger.path = '/appeals/{appealId}/appeal-status/roll-back'
        #swagger.description = 'Roll back appeal status to a previous state'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.requestBody = {
            in: 'body',
            description: 'Appeal status',
            schema: { $ref: '#/components/schemas/AppealStatusRollBackRequest' },
            required: true
        }
        #swagger.responses[400] = {}
	*/
	checkAppealExistsByIdAndAddToRequest,
	validateAppealStatusRollBackRequest,
	asyncHandler(controller.rollBackAppealStatus)
);

export { router as appealStatusRoutes };
