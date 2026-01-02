import { clearUncommittedFilesFromSession } from '#appeals/appeal-documents/appeal-documents.middleware.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { Router } from 'express';
import { validateStatus } from '../common/validators.js';
import addDocumentRouter from '../document-attachments/add-document.router.js';
import { getRepresentationAttachmentsFolder } from '../document-attachments/attachments-middleware.js';
import manageDocumentsRouter from '../document-attachments/manage-documents.router.js';
import incompleteRouter from './incomplete/incomplete.router.js';
import redactRouter from './redact/redact.router.js';
import {
	postReviewRule6PartyStatement,
	renderReviewRule6PartyStatement
} from './rule-6-party-statement.controller.js';
import validRouter from './valid/valid.router.js';

const router = Router({ mergeParams: true });

router.use('/add-document', getRepresentationAttachmentsFolder, addDocumentRouter);

router.use('/manage-documents', getRepresentationAttachmentsFolder, manageDocumentsRouter);

router
	.route('')
	.get(clearUncommittedFilesFromSession, renderReviewRule6PartyStatement)
	.post(
		validateStatus,
		saveBodyToSession('rule6PartyStatement', { scopeToAppeal: true }),
		postReviewRule6PartyStatement
	);

router.use('/valid', validRouter);

router.use('/incomplete', incompleteRouter);

router.use('/redact', redactRouter);

export default router;
