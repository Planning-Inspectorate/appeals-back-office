import {
	validateSiteVisit,
	validateStatus
} from '#appeals/appeal-details/representations/common/validators.js';
import addDocumentRouter from '#appeals/appeal-details/representations/document-attachments/add-document.router.js';
import manageDocumentsRouter from '#appeals/appeal-details/representations/document-attachments/manage-documents.router.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import rejectRouter from './reject/reject.router.js';
import * as controller from './view-and-review.controller.js';
import {
	redirectIfCommentIsReviewed,
	redirectIfCommentIsUnreviewed
} from './view-and-review.middleware.js';

const router = createRouter({ mergeParams: true });

// Redirects to review to correct back link within shared addDocumentRouter and manageDocumentsRouter
router.get('/', redirectIfCommentIsUnreviewed, redirectIfCommentIsReviewed);
router.get('/add-document/review', redirectIfCommentIsUnreviewed);

router.use('/reject', rejectRouter);

router.use('/add-document', addDocumentRouter);

router
	.route('/view')
	.get(redirectIfCommentIsUnreviewed, asyncHandler(controller.renderViewInterestedPartyComment));

router
	.route('/review')
	.get(redirectIfCommentIsReviewed, asyncHandler(controller.renderReviewInterestedPartyComment))
	.post(
		validateSiteVisit,
		validateStatus,
		asyncHandler(controller.postReviewInterestedPartyComment)
	);

router.use('/manage-documents', manageDocumentsRouter);

export default router;
