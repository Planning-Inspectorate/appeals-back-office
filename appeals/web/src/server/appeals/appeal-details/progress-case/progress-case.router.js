import { Router as createRouter } from 'express';
import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';
import fromFinalCommentsRouter from './from-final-comments/from-final-comments.router.js';

const router = createRouter({ mergeParams: true });

router.use('/from-final-comments', validateAppeal, fromFinalCommentsRouter);

export default router;
