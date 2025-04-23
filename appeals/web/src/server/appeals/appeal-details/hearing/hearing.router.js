import { Router as createRouter } from 'express';
import setUpHearingRouter from './setup/set-up-hearing.router.js';

const router = createRouter({ mergeParams: true });

router.use('/setup', setUpHearingRouter);

export default router;
