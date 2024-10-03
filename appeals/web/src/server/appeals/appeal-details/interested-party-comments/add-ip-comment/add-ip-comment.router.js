import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './add-ip-comment.controller.js';

const router = createRouter({ mergeParams: true });

router.route('/:step?').get(asyncHandler(controller.renderStep));

export default router;
