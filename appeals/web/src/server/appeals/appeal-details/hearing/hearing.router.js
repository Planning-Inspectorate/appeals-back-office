import { Router as createRouter } from 'express';
import estimatesRouter from './estimates/estimates.router.js';
import cancelHearingRouter from './setup/cancel-hearing.router.js';
import changeHearingRouter from './setup/change-hearing.router.js';
import setUpHearingRouter from './setup/set-up-hearing.router.js';

const router = createRouter({ mergeParams: true });

router.use('/setup', setUpHearingRouter);
router.use('/change', changeHearingRouter);
router.use('/cancel', cancelHearingRouter);
router.use('/estimates', estimatesRouter);

export default router;
