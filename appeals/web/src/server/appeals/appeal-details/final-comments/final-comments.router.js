import { Router as createRouter } from 'express';
import { validateAppeal } from '../appeal-details.middleware.js';
import viewAndReviewFinalCommentsRouter from './view-and-review/view-and-review.router.js';
import redactFinalCommentsRouter from './redact/redact.router.js';
import rejectFinalCommentsRouter from './reject/reject.router.js';
import acceptFinalCommentsRouter from './accept/accept.router.js';
import { withSingularRepresentation } from './final-comments.middleware.js';

const router = createRouter({ mergeParams: true });

router.use(
	'/:finalCommentsType',
	validateAppeal,
	withSingularRepresentation,
	viewAndReviewFinalCommentsRouter
);

router.use(
	'/:finalCommentsType/redact',
	validateAppeal,
	withSingularRepresentation,
	redactFinalCommentsRouter
);

router.use(
	'/:finalCommentsType/reject',
	validateAppeal,
	withSingularRepresentation,
	rejectFinalCommentsRouter
);

router.use(
	'/:finalCommentsType/accept',
	validateAppeal,
	withSingularRepresentation,
	acceptFinalCommentsRouter
);


export default router;
