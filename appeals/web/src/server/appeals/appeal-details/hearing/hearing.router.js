import { Router as createRouter } from 'express';
import setUpHearingRouter from './setup/set-up-hearing.router.js';
import estimatesRouter from './estimates/estimates.router.js';

const router = createRouter({ mergeParams: true });

router.use('/setup', setUpHearingRouter);
router.use('/estimates', estimatesRouter);

export default router;
