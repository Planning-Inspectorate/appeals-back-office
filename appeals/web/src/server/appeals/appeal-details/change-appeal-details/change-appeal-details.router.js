import { Router as createRouter } from 'express';
import localPlanningAuthorityRouter from './local-planning-authority/local-planning-authority.router.js';

const router = createRouter({ mergeParams: true });

router.use('/local-planning-authority', localPlanningAuthorityRouter);

export default router;
