import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { getAppealTypes, patchAppealTypeNotifySuppression } from './appeal-types.controller.js';
import { patchAppealTypeNotifySuppressionValidator } from './appeal-types.validators.js';

const router = createRouter();

router.get(
	'/appeal-types',
	/*
		#swagger.tags = ['Appeal Types']
		#swagger.path = '/appeals/appeal-types'
		#swagger.description = 'Gets the list of appeal types'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.parameters['filterEnabled'] = {
			in: 'header',
			required: false,
			example: true
		}
		#swagger.responses[200] = {
			description: 'List of appeal types',
			schema: { $ref: '#/components/schemas/AppealTypes' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(getAppealTypes)
);

router.patch(
	'/appeal-types/:id/notify-suppression',
	/*
		#swagger.tags = ['Appeal Types']
		#swagger.path = '/appeals/appeal-types/{id}/notify-suppression'
		#swagger.description = 'Updates notification suppression flag for an appeal type'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: false,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Appeal type notification suppression details',
			schema: {
				type: 'object',
				properties: {
					suppressNotifications: { type: 'boolean' }
				},
				required: ['suppressNotifications']
			}
		}
		#swagger.responses[200] = {
			description: 'Updated appeal type',
			schema: { $ref: '#/components/schemas/AppealType' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[500] = {}
	 */
	patchAppealTypeNotifySuppressionValidator,
	asyncHandler(patchAppealTypeNotifySuppression)
);

export { router as appealTypeRoutes };
