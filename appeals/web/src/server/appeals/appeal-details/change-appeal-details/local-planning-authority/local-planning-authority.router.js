import { Router as createRouter } from 'express';
import * as controllers from './local-planning-authority.controller.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router.route('/').get(asyncHandler(controllers.getChangeLpa));

export default router;
