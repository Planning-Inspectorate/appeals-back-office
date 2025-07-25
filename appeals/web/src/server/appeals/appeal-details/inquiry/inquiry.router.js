import { Router as createRouter } from 'express';
import setUpInquiryRouter from './setup/set-up-inquiry.router.js';
import estimatesRouter from './estimates/estimates.router.js';
import changeInquiryRouter from './setup/change-inquiry.router.js';
import * as controller from './setup/set-up-inquiry.controller.js';

const router = createRouter({ mergeParams: true });

router.use('/setup', setUpInquiryRouter);
router.use('/estimates', estimatesRouter);
router.use('/change', controller.updateInquirySession, changeInquiryRouter);

export default router;
