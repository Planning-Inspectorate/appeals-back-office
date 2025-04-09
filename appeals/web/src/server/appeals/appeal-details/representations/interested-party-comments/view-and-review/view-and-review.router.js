import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './view-and-review.controller.js';
import rejectRouter from './reject/reject.router.js';
import * as documentsValidators from '../../../../appeal-documents/appeal-documents.validators.js';
import {
	redirectIfCommentIsReviewed,
	redirectIfCommentIsUnreviewed
} from './view-and-review.middleware.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import {
	validateCaseDocumentId,
	validateCaseFolderId
} from '#appeals/appeal-documents/appeal-documents.middleware.js';
import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';
import { validateStatus } from '#appeals/appeal-details/representations/common/validators.js';
import manageDocumentsRouter from '#appeals/appeal-details/representations/document-attachments/manage-documents.router.js';
import { validateComment } from '#appeals/appeal-details/representations/interested-party-comments/interested-party-comments.middleware.js';
import addDocumentRouter from '#appeals/appeal-details/representations/document-attachments/add-document.router.js';

const router = createRouter({ mergeParams: true });

// Redirects to review to correct back link within shared addDocumentRouter and manageDocumentsRouter
router.get('/', redirectIfCommentIsUnreviewed, redirectIfCommentIsReviewed);
router.get('/add-document/review', redirectIfCommentIsUnreviewed);

router.use('/reject', rejectRouter);

router.use('/add-document', validateAppeal, validateComment, addDocumentRouter);

router
	.route('/view')
	.get(redirectIfCommentIsUnreviewed, asyncHandler(controller.renderViewInterestedPartyComment));

router
	.route('/review')
	.get(redirectIfCommentIsReviewed, asyncHandler(controller.renderReviewInterestedPartyComment))
	.post(validateStatus, asyncHandler(controller.postReviewInterestedPartyComment));

router.use('/manage-documents', manageDocumentsRouter);

router
	.route('/manage-documents/:folderId/:documentId/:versionId/delete')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncHandler(controller.getDeleteDocument)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		documentsValidators.validateDocumentDeleteAnswer,
		asyncHandler(controller.postDeleteDocumentPage)
	);

export default router;
