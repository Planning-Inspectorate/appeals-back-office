import { validateComment } from '#appeals/appeal-details/representations/interested-party-comments/interested-party-comments.middleware.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateAppeal } from '../../../appeal-details.middleware.js';
import {
	postConfirmRedactInterestedPartyComment,
	postRedactInterestedPartyComment,
	renderConfirmRedactInterestedPartyComment,
	renderRedactInterestedPartyComment
} from './redact.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/confirm')
	.get(validateAppeal, validateComment, asyncHandler(renderConfirmRedactInterestedPartyComment))
	.post(validateAppeal, validateComment, asyncHandler(postConfirmRedactInterestedPartyComment));

router
	.route('/')
	.get(validateAppeal, validateComment, asyncHandler(renderRedactInterestedPartyComment))
	.post(validateAppeal, validateComment, asyncHandler(postRedactInterestedPartyComment));

export default router;
