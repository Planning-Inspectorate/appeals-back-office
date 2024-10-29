import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { validateAppeal } from '../../appeal-details.middleware.js';
import { validateComment } from '../interested-party-comments.middleware.js';
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
