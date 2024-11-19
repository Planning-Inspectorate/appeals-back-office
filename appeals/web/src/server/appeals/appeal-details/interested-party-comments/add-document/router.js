import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import {
	renderDocumentUpload,
	postDocumentUpload,
	renderDateSubmitted,
	renderRedactionStatus,
	postDateSubmitted,
	postRedactionStatus
} from './controller/index.js';
import {
	validateCommentSubmittedDateFields,
	validateCommentSubmittedDateValid,
	validateRedactionStatus
} from '../add-ip-comment/add-ip-comment.validators.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { createDateInputDateInPastOrTodayValidator } from '#lib/validators/date-input.validator.js';

const router = createRouter({ mergeParams: true });

router.get('/', asyncHandler(renderDocumentUpload));
router.post('/', asyncHandler(postDocumentUpload));

router.get('/redaction-status', asyncHandler(renderRedactionStatus));
router.post(
	'/redaction-status',
	validateRedactionStatus,
	saveBodyToSession('addDocument'),
	asyncHandler(postRedactionStatus)
);

router.get('/date-submitted', asyncHandler(renderDateSubmitted));
router.post(
	'/date-submitted',
	validateCommentSubmittedDateFields,
	validateCommentSubmittedDateValid,
	createDateInputDateInPastOrTodayValidator(),
	saveBodyToSession('addDocument'),
	asyncHandler(postDateSubmitted)
);

export default router;
