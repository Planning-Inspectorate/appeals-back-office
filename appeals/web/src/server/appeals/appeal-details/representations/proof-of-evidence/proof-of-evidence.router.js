import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';
import { Router as createRouter } from 'express';
import addDocumentRouter from '../document-attachments/add-document.router.js';
import { getRepresentationAttachmentsFolder } from '../document-attachments/attachments-middleware.js';
import manageDocumentsRouter from '../document-attachments/manage-documents.router.js';
import acceptProofOfEvidenceRouter from './accept/accept.router.js';
import addRepresentationRouter from './add-representation/add-representation.router.js';
import incompleteProofOfEvidenceRouter from './incomplete/incomplete.router.js';
import {
	addPageContentToLocals,
	withSingularRepresentation
} from './proof-of-evidence.middleware.js';
import viewAndReviewProofOfEvidenceRouter from './view-and-review/view-and-review.router.js';

const router = createRouter({ mergeParams: true });

router.use(
	'/:proofOfEvidenceType/add-representation',
	validateAppeal,
	getRepresentationAttachmentsFolder,
	addRepresentationRouter
);

router.use(
	'/:proofOfEvidenceType',
	validateAppeal,
	withSingularRepresentation,
	viewAndReviewProofOfEvidenceRouter
);

router.use(
	'/:proofOfEvidenceType/add-document',
	validateAppeal,
	addPageContentToLocals,
	withSingularRepresentation,
	getRepresentationAttachmentsFolder,
	addDocumentRouter
);

router.use(
	'/:proofOfEvidenceType/manage-documents',
	validateAppeal,
	addPageContentToLocals,
	withSingularRepresentation,
	getRepresentationAttachmentsFolder,
	manageDocumentsRouter
);

router.use(
	'/:proofOfEvidenceType/accept',
	validateAppeal,
	withSingularRepresentation,
	acceptProofOfEvidenceRouter
);

router.use(
	'/:proofOfEvidenceType/incomplete',
	validateAppeal,
	withSingularRepresentation,
	incompleteProofOfEvidenceRouter
);

export default router;
