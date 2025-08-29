import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './personal-list.controller.js';

const router = createRouter();

router.route('/').get(asyncHandler(controller.viewPersonalList));

export default router;
