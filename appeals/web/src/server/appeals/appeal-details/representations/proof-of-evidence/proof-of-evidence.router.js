import { Router as createRouter } from 'express';
import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';
import viewAndReviewProofOfEvidenceRouter from './view-and-review/view-and-review.router.js';
import {
	getRepresentationAttachmentsFolder,
	withSingularRepresentation
} from './proof-of-evidence.middleware.js';
import manageDocumentsRouter from '../document-attachments/manage-documents.router.js';
import acceptProofOfEvidenceRouter from './accept/accept.router.js';

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

export default router;
