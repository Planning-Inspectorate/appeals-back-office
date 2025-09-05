import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';
import { Router as createRouter } from 'express';
import manageDocumentsRouter from '../document-attachments/manage-documents.router.js';
import acceptProofOfEvidenceRouter from './accept/accept.router.js';
import incompleteProofOfEvidenceRouter from './incomplete/incomplete.router.js';
import {
	getRepresentationAttachmentsFolder,
	withSingularRepresentation
} from './proof-of-evidence.middleware.js';
import viewAndReviewProofOfEvidenceRouter from './view-and-review/view-and-review.router.js';

const router = createRouter({ mergeParams: true });

router.use(
	'/:proofOfEvidenceType',
	validateAppeal,
	withSingularRepresentation,
	viewAndReviewProofOfEvidenceRouter
);

router.use(
	'/:proofOfEvidenceType/change',
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
