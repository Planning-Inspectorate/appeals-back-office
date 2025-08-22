import { Router as createRouter } from 'express';
import * as controllers from './change-procedure-selection.controller.js';
import * as validators from './change-procedure-selection.validators.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controllers.getSelectProcedure))
	.post(validators.validateSelectProcedure, asyncHandler(controllers.postChangeSelectProcedure));

export default router;
