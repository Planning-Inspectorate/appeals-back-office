import { Router as createRouter } from 'express';
import setUpInquiryRouter from './setup/set-up-inquiry.router.js';
import estimatesRouter from './estimates/estimates.router.js';

const router = createRouter({ mergeParams: true });

router.use('/setup', setUpInquiryRouter);
router.use('/estimates', estimatesRouter);

export default router;
