import { Router as createRouter } from 'express';
import { validateAppeal } from '../appeal-details.middleware.js';
import viewAndReviewFinalCommentsRouter from './view-and-review/view-and-review.router.js';
import redactFinalCommentsRouter from './redact/redact.router.js';
import rejectFinalCommentsRouter from './reject/reject.router.js';
import { withSingularRepresentation } from './final-comments.middleware.js';
import supportingDocumentsRouter from './supporting-documents/supporting-documents.router.js';

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
	'/:finalCommentsType/supporting-documents',
	validateAppeal,
	withSingularRepresentation,
	supportingDocumentsRouter
);

export default router;
