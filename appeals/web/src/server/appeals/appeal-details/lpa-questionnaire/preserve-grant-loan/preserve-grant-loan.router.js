import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controllers from './preserve-grant-loan.controller.js';
import { validatePreserveGrantLoan } from './preserve-grant-loan.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangePreserveGrantLoan))
	.post(validatePreserveGrantLoan, asyncHandler(controllers.postChangePreserveGrantLoan));

export default router;
