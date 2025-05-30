import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateAppeal } from '../../appeal-details.middleware.js';
import addIpCommentRouter from './add-ip-comment/add-ip-comment.router.js';
import editIpCommentRouter from './edit-ip-comment/edit-ip-comment.router.js';
import viewAndReviewIpCommentRouter from './view-and-review/view-and-review.router.js';
import redactIpCommentRouter from './redact/redact.router.js';
import * as controller from './interested-party-comments.controller.js';
import { validateComment } from './interested-party-comments.middleware.js';
import { clearUncommittedFilesFromSession } from '#appeals/appeal-documents/appeal-documents.middleware.js';

const router = createRouter({ mergeParams: true });

router.use('/add', validateAppeal, addIpCommentRouter);

router.use('/:commentId/redact', redactIpCommentRouter);

router.use('/:commentId/edit', validateAppeal, validateComment, editIpCommentRouter);

router.use('/:commentId', validateAppeal, validateComment, viewAndReviewIpCommentRouter);

// Redirect as shared manage documents routes return to the wrong page after a successful delete
router.get('/:commentId', (request, response) => {
	response.redirect(`${request.baseUrl}/${request.params.commentId}/view`);
});

router
	.route('/')
	.get(
		validateAppeal,
		clearUncommittedFilesFromSession,
		asyncHandler(controller.handleInterestedPartyComments)
	);

export default router;
