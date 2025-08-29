import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import {
	createDateInputDateInPastOrTodayValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
import { validateRedactionStatus } from '#lib/validators/redaction-status-validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	postDateSubmitted,
	postDocumentUpload,
	postRedactionStatus,
	renderDateSubmitted,
	renderDocumentUpload,
	renderRedactionStatus
} from '../../document-attachments/add-document.controller.js';
import {
	postCheckYourAnswers,
	renderCheckYourAnswers
} from '../../document-attachments/controller/check-your-answers.js';

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
	createDateInputFieldsValidator('', '', 'day', 'month', 'year'),
	createDateInputDateValidityValidator('', '', 'day', 'month', 'year'),
	saveBodyToSession('addDocument'),
	createDateInputDateInPastOrTodayValidator('', '', 'day', 'month', 'year'),
	asyncHandler(postDateSubmitted)
);

router.get('/check-your-answers', asyncHandler(renderCheckYourAnswers));
router.post('/check-your-answers', asyncHandler(postCheckYourAnswers));

export default router;
