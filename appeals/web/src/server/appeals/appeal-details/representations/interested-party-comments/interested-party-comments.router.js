import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateAppeal } from '../../appeal-details.middleware.js';
import addIpCommentRouter from './add-ip-comment/add-ip-comment.router.js';
import editIpCommentRouter from './edit-ip-comment/edit-ip-comment.router.js';
import addDocumentRouter from './add-document/add-document.router.js';
import viewAndReviewIpCommentRouter from './view-and-review/view-and-review.router.js';
import redactIpCommentRouter from './redact/redact.router.js';
import * as controller from './interested-party-comments.controller.js';
import { validateComment } from './interested-party-comments.middleware.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import { withSingularRepresentation } from '../representations.middleware.js';

const router = createRouter({ mergeParams: true });

router.use('/add', validateAppeal, addIpCommentRouter);

router.use('/:commentId/redact', redactIpCommentRouter);

router.use('/:commentId/edit', validateAppeal, validateComment, editIpCommentRouter);

router.use('/:commentId/add-document', validateAppeal, validateComment, addDocumentRouter);

router.use(
	'/:commentId',
	validateAppeal,
	validateComment,
	withSingularRepresentation(APPEAL_REPRESENTATION_TYPE.COMMENT),
	viewAndReviewIpCommentRouter
);

router.route('/').get(validateAppeal, asyncHandler(controller.handleInterestedPartyComments));

export default router;
