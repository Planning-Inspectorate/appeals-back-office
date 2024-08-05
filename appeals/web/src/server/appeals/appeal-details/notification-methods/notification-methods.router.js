import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controllers from './notification-methods.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeNotificationMethods))
	.post(asyncHandler(controllers.postChangeNotificationMethods));

export default router;
