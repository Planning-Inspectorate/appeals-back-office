import { Router as createRouter } from 'express';
import * as controllers from './check-and-confirm.controller.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router.route('/').get(asyncHandler(controllers.getCheckAndConfirm));

export default router;
