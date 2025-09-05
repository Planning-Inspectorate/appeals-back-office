import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import {
	createDateInputDateInPastOrTodayValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateRedactionStatus } from '../representations.validators.js';
import {
	postDateSubmitted,
	postDocumentUpload,
	postRedactionStatus,
	renderDateSubmitted,
	renderDocumentUpload,
	renderRedactionStatus
} from './add-document.controller.js';
import { postCheckYourAnswers, renderCheckYourAnswers } from './controller/check-your-answers.js';

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
	createDateInputFieldsValidator('', 'Date', 'day', 'month', 'year'),
	createDateInputDateValidityValidator('', 'Date', 'day', 'month', 'year'),
	saveBodyToSession('addDocument'),
	createDateInputDateInPastOrTodayValidator('', '', 'day', 'month', 'year'),
	asyncHandler(postDateSubmitted)
);

router.get('/check-your-answers', asyncHandler(renderCheckYourAnswers));
router.post('/check-your-answers', asyncHandler(postCheckYourAnswers));

export default router;
