import { checkAppealExistsByIdAndAddPartialToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	getAuditNotifications,
	getNotifications,
	patchNotifySuppression
} from './notification.controller.js';
import { patchNotifySuppressionValidator } from './notifications.validators.js';

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
	checkAppealExistsByIdAndAddPartialToRequest([]),
	asyncHandler(getNotifications)
);
router.get(
	'/:appealId/audit-notifications',
	/*
		#swagger.tags = ['Notifications']
		#swagger.path = '/appeals/{appealId}/audit-notifications'
		#swagger.description = Retrieves a log of the emails sent for a single appeal and sends the renvered version for the case history
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[400] = {}
		#swagger.responses[200] = {
			description: 'Returns the notification list',
			schema: { $ref: '#/components/schemas/AuditNotifications' }
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	checkAppealExistsByIdAndAddPartialToRequest([]),
	asyncHandler(getAuditNotifications)
);

router.patch(
	'/:appealId/notify-suppression',
	/*
		#swagger.tags = ['Notifications']
		#swagger.path = '/appeals/{appealId}/notify-suppression'
		#swagger.description = Sets or overrides notification suppression on an individual appeal
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: false,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.requestBody = {
			in: 'body',
			description: 'Notification suppression override (true to suppress, false to force send, null to inherit)',
			schema: {
				type: 'object',
				properties: {
					suppressNotifications: { type: 'boolean', nullable: true }
				},
				required: ['suppressNotifications']
			}
		}
		#swagger.responses[200] = {
			description: 'Returns updated appeal notification suppression status',
			schema: {
				id: 1,
				suppressNotifications: true
			}
		}
		#swagger.responses[400] = {}
		#swagger.responses[404] = {}
	 */
	patchNotifySuppressionValidator,
	checkAppealExistsByIdAndAddPartialToRequest([]),
	asyncHandler(patchNotifySuppression)
);

export { router as appealNotificationRouter };
