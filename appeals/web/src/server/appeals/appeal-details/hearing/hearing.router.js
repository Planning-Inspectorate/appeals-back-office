import { Router as createRouter } from 'express';
import setUpHearingRouter from './setup/set-up-hearing.router.js';
import addEstimatesRouter from './add-estimates/add-estimates.router.js';

const router = createRouter({ mergeParams: true });

router.use('/setup', setUpHearingRouter);
router.use('/add-estimates', addEstimatesRouter);

export default router;
