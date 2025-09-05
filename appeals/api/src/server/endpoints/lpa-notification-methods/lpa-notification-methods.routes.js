import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { getLookupData } from '../../common/controllers/lookup-data.controller.js';

const router = createRouter();

router.get(
	'/lpa-notification-methods',
	/*
		#swagger.tags = ['LPA Notification Methods']
		#swagger.path = '/appeals/lpa-notification-methods'
		#swagger.description = 'Gets LPA notification methods'
		#swagger.parameters['azureAdUserId'] = {
			in: 'header',
			required: true,
			example: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
		}
		#swagger.responses[200] = {
			description: 'LPA notification methods',
			schema: { $ref: '#/components/schemas/AllLPANotificationMethodsResponse' },
		}
		#swagger.responses[400] = {}
	 */
	asyncHandler(getLookupData('lPANotificationMethods'))
);

export { router as lpaNotificationMethodsRoutes };
