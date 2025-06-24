import { Router as createRouter } from 'express';
import setUpInquiryRouter from './setup/set-up-inquiry.router.js';

const router = createRouter({ mergeParams: true });

router.use('/setup', setUpInquiryRouter);

export default router;
