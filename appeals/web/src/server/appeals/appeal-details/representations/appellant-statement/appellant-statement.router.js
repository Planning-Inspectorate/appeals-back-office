import { clearUncommittedFilesFromSession } from '#appeals/appeal-documents/appeal-documents.middleware.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { Router } from 'express';
import { validateStatus } from '../common/validators.js';
import addDocumentRouter from '../document-attachments/add-document.router.js';
import { getRepresentationAttachmentsFolder } from '../document-attachments/attachments-middleware.js';
import manageDocumentsRouter from '../document-attachments/manage-documents.router.js';
import {
	postReviewAppellantStatement,
	renderReviewAppellantStatement
} from './appellant-statement.controller.js';
import incompleteRouter from './incomplete/incomplete.router.js';
import redactRouter from './redact/redact.router.js';
import validRouter from './valid/valid.router.js';

const router = Router({ mergeParams: true });

router
	.route('/')
	.get(clearUncommittedFilesFromSession, renderReviewAppellantStatement)
	.post(
		validateStatus,
		saveBodyToSession('appellantStatement', { scopeToAppeal: true }),
		postReviewAppellantStatement
	);

router.use(
	'/incomplete',
	saveBodyToSession('appellantStatement', { scopeToAppeal: true }),
	incompleteRouter
);

router.use('/valid', validRouter);

router.use('/redact', redactRouter);

router.use('/add-document', getRepresentationAttachmentsFolder, addDocumentRouter);

router.use('/manage-documents', getRepresentationAttachmentsFolder, manageDocumentsRouter);

export default router;
