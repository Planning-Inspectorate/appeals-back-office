import { saveBackUrl } from '#lib/middleware/save-back-url.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import hearingRouter from './hearing/hearing.router.js';
import * as controller from './start-case.controller.js';
import * as validators from './start-case.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/add')
	.get(saveBackUrl('startCase'), asyncHandler(controller.getStartDate))
	.post(asyncHandler(controller.postStartDate));

router
	.route('/change')
	.get(asyncHandler(controller.getChangeDate))
	.post(asyncHandler(controller.postChangeDate));

router
	.route('/select-procedure')
	.get(asyncHandler(controller.getSelectProcedure))
	.post(
		validators.validateAppealProcedure,
		saveBodyToSession('startCaseAppealProcedure', { scopeToAppeal: true }),
		asyncHandler(controller.postSelectProcedure)
	);

router
	.route('/select-procedure/check-and-confirm')
	.get(asyncHandler(controller.getConfirmProcedure))
	.post(asyncHandler(controller.postConfirmProcedure));

router.use('/hearing', hearingRouter);

export default router;
