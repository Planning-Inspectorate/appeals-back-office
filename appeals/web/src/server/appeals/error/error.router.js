import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './error.controller.js';

const router = createRouter();

router.route('/').get(asyncHandler(controller.viewError));

export default router;
