import { Router as createRouter } from 'express';
import * as controllers from './change-lpa-reference.controller.js';
import asyncRoute from '#lib/async-route.js';
import * as validators from './change-lpa-reference.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncRoute(controllers.getChangeLpaReference))
	.post(validators.validateChangeLpaReference, asyncRoute(controllers.postChangeLpaReference));

export default router;
