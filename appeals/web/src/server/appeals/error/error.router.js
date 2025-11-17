import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './error.controller.js';

const router = createRouter();

router.route('/').get(asyncHandler(controller.viewError));

if (process.env.NODE_ENV !== 'production') {
	router.route('/:errorCode').get(controller.getTestErrorPage);
}

export default router;
