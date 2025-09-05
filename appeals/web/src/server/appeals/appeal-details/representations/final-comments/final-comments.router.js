import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';
import { Router as createRouter } from 'express';
import addDocumentRouter from '../document-attachments/add-document.router.js';
import manageDocumentsRouter from '../document-attachments/manage-documents.router.js';
import acceptFinalCommentsRouter from './accept/accept.router.js';
import {
	getRepresentationAttachmentsFolder,
	withSingularRepresentation
} from './final-comments.middleware.js';
import redactFinalCommentsRouter from './redact/redact.router.js';
import rejectFinalCommentsRouter from './reject/reject.router.js';
import viewAndReviewFinalCommentsRouter from './view-and-review/view-and-review.router.js';

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
	'/:finalCommentsType/add-document',
	withSingularRepresentation,
	getRepresentationAttachmentsFolder,
	addDocumentRouter
);

router.use(
	'/:finalCommentsType/manage-documents',
	withSingularRepresentation,
	getRepresentationAttachmentsFolder,
	manageDocumentsRouter
);

router.use(
	'/:finalCommentsType/accept',
	validateAppeal,
	withSingularRepresentation,
	acceptFinalCommentsRouter
);

export default router;
