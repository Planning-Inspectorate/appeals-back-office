import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	postCheckYourAnswers,
	postDocumentUpload,
	renderCheckYourAnswers,
	renderDocumentUpload
} from './add-representation.controller.js';

const router = createRouter({ mergeParams: true });

router.get('/', asyncHandler(renderDocumentUpload));
router.post('/', asyncHandler(postDocumentUpload));

router.get('/check-your-answers', asyncHandler(renderCheckYourAnswers));
router.post('/check-your-answers', asyncHandler(postCheckYourAnswers));

export default router;
