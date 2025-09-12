import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	postConfirmRedactInterestedPartyComment,
	postRedactInterestedPartyComment,
	renderConfirmRedactInterestedPartyComment,
	renderRedactInterestedPartyComment
} from './redact.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/confirm')
	.get(asyncHandler(renderConfirmRedactInterestedPartyComment))
	.post(asyncHandler(postConfirmRedactInterestedPartyComment));

router
	.route('/')
	.get(asyncHandler(renderRedactInterestedPartyComment))
	.post(asyncHandler(postRedactInterestedPartyComment));

export default router;
