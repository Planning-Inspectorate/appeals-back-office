import { Router as createRouter } from 'express';
import addRouter from './add/add.router.js';

const router = createRouter({ mergeParams: true });

router.use('/add', addRouter);

export default router;
