import { Router as createRouter } from 'express';
import addRouter from './add/add.router.js';
import manageRouter from './manage/manage.router.js';

const router = createRouter({ mergeParams: true });

router.use('/add', addRouter);
router.use('/manage', manageRouter);

export default router;
