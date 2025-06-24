import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { checkAppealExistsByIdAndAddToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { getNotifications } from './notification.controller.js';

const router = createRouter();

router.get(
	'/:appealId/notifications',
	/*
		#swagger.tags = ['Notifications']
		#swagger.path = '/appeals/{appealId}/notifications'
		#swagger.description = Retrieves a log of the emails sent for a single appeal
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[400] = {}
		#swagger.responses[200] = {
			description: 'Returns the notification list',
			schema: { $ref: '#/components/schemas/Notifications' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	checkAppealExistsByIdAndAddToRequest,
	asyncHandler(getNotifications)
);

export { router as appealNotificationRouter };
