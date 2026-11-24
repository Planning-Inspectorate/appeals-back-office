import {
	checkAppealExistsById,
	checkAppealExistsByIdAndAddPartialToRequest
} from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './appeal-status.controller.js';
import {
	getAppealStatusDateValidator,
	validateAppealStatusRollBackRequest,
	validateUpdateAppealStatusRequest
} from './appeal-status.validators.js';

const router = createRouter();

router.patch(
	'/:appealId/appeal-status',
	/*
        #swagger.tags = ['Appeal Status']
        #swagger.path = '/appeals/{appealId}/appeal-status'
        #swagger.description = 'Manually update appeal status for generic appeal'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.requestBody = {
            in: 'body',
            description: 'Appeal status',
            schema: { type: 'object', properties: { status: { type: 'string' } }, required: ['status'] },
            required: true
        }
        #swagger.responses[200] = {
            description: 'Updated appeal status',
            schema: { success: true, status: 'statements' }
        }
        #swagger.responses[400] = {}
        #swagger.responses[404] = {}
	*/
	checkAppealExistsByIdAndAddPartialToRequest(['appealType']),
	validateUpdateAppealStatusRequest,
	asyncHandler(controller.updateAppealStatus)
);

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
	checkAppealExistsById,
	validateAppealStatusRollBackRequest,
	asyncHandler(controller.rollBackAppealStatus)
);

router.get(
	'/:appealId/appeal-status/:status/created-date',
	/*
        #swagger.tags = ['Appeal Status']
        #swagger.path = '/appeals/{appealId}/appeal-status/{status}/created-date'
		#swagger.description = 'Gets a single status created date by id'
        #swagger.parameters['azureAdUserId'] = {
            in: 'header',
            required: true,
            example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
        }
        #swagger.responses[200] = {
			description: 'Created date for appeal status',
			schema: '2050-01-01T10:30:00.000Z',
		}
		#swagger.responses[400] = {}
        #swagger.responses[404] = {}
	*/
	checkAppealExistsByIdAndAddPartialToRequest([]),
	getAppealStatusDateValidator,
	asyncHandler(controller.getAppealStatusCreatedDate)
);

export { router as appealStatusRoutes };
