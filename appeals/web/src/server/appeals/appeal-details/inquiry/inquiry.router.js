import inquiryDocumentsRouter from '#appeals/appeal-details/inquiry/documents/inquiry-documents.router.js';
import { isFeatureActive } from '#common/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { Router as createRouter } from 'express';
import cancelInquiryRouter from './cancel/cancel-inquiry.router.js';
import estimatesRouter from './estimates/estimates.router.js';
import changeInquiryRouter from './setup/change-inquiry.router.js';
import * as controller from './setup/set-up-inquiry.controller.js';
import setUpInquiryRouter from './setup/set-up-inquiry.router.js';

const router = createRouter({ mergeParams: true });

router.use('/setup', setUpInquiryRouter);
router.use('/estimates', estimatesRouter);
router.use('/change', controller.updateInquirySession, changeInquiryRouter);
router.use('/cancel', cancelInquiryRouter);

if (isFeatureActive(FEATURE_FLAG_NAMES.FEATURE_FLAG_SHARING_INQUIRY_DOCUMENTS)) {
	router.use('/documents', inquiryDocumentsRouter);
}
export default router;
