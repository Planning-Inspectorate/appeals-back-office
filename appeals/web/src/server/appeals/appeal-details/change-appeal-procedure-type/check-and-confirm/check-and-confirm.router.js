import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './check-and-confirm.controller.js';

const router = createRouter({ mergeParams: true });

router.route('/').get(asyncHandler(controllers.getCheckAndConfirm));

export default router;
