import { saveBackUrl } from '#lib/middleware/save-back-url.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './manage.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(saveBackUrl('manageRule6Parties'), asyncHandler(controller.getManageRule6Parties));

export default router;
