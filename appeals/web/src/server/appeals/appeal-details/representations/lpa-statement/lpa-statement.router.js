import { Router } from 'express';
import { postReviewLpaStatement, renderReviewLpaStatement } from './lpa-statement.controller.js';
import { validateStatus } from '../common/validators.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import incompleteRouter from './incomplete/incomplete.router.js';
import validRouter from './valid/valid.router.js';

const router = Router({ mergeParams: true });

router.get('/', renderReviewLpaStatement);
router.post('/', validateStatus, saveBodyToSession('lpaStatement'), postReviewLpaStatement);

router.use('/incomplete', incompleteRouter);

router.use('/valid', validRouter);

export default router;
