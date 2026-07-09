import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateCaseFolderId } from '../../appeal-documents/appeal-documents.middleware.js';
import * as controller from './withdrawal.controller.js';

const router = createRouter({ mergeParams: true });

router.route('/view').get(
	(req, _, next) => {
		const { currentAppeal } = req;
		// folderId is expected as a param on other manage folder routes but this one is implied
		//@ts-ignore
		req.params.folderId = currentAppeal.withdrawal?.withdrawalFolder?.folderId;
		next();
	},
	validateCaseFolderId,
	asyncHandler(controller.getViewWithdrawalDocumentFolder)
);

router
	.route('/new')
	.get(asyncHandler(controller.getWithdrawalRequestUpload))
	.post(asyncHandler(controller.postWithdrawalRequestRequestUpload));

router
	.route('/check-details')
	.get(asyncHandler(controller.getCheckYourAnswers))
	.post(asyncHandler(controller.postCheckYourAnswers));

export default router;
