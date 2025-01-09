import { Router } from 'express';
import { postReviewLpaStatement, renderReviewLpaStatement } from './lpa-statement.controller.js';
import { validateStatus } from '../common/validators.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import incompleteRouter from './incomplete/incomplete.router.js';
import validRouter from './valid/valid.router.js';
import redactRouter from './redact/redact.router.js';

const router = Router({ mergeParams: true });

router
	.route('/')
	.get(renderReviewLpaStatement)
	.post(validateStatus, saveBodyToSession('lpaStatement'), postReviewLpaStatement);

router.use('/incomplete', saveBodyToSession('lpaStatement'), incompleteRouter);

router.use('/valid', validRouter);

router.use('/redact', redactRouter);

export default router;
