import { extractAndProcessDocumentDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as documentsValidators from '../../../../appeal-documents/appeal-documents.validators.js';
import {
	postCheckYourAnswers,
	postDocumentDetails,
	postDocumentUpload,
	renderCheckYourAnswers,
	renderDocumentDetails,
	renderDocumentUpload
} from '../../document-attachments/add-document.controller.js';

const router = createRouter({ mergeParams: true });

router.get('/', asyncHandler(renderDocumentUpload));
router.post('/', asyncHandler(postDocumentUpload));

router.get('/add-document-details', asyncHandler(renderDocumentDetails));
router.post(
	'/add-document-details',
	documentsValidators.validateDocumentDetailsBodyFormat,
	documentsValidators.validateDocumentDetailsReceivedDatesFields,
	documentsValidators.validateDocumentDetailsReceivedDateValid,
	documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
	documentsValidators.validateDocumentDetailsRedactionStatuses,
	extractAndProcessDocumentDateErrors(),
	asyncHandler(postDocumentDetails)
);

router.get('/check-your-answers', asyncHandler(renderCheckYourAnswers));
router.post('/check-your-answers', asyncHandler(postCheckYourAnswers));

export default router;
