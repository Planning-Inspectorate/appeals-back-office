import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './change-page.controller.js';

const router = createRouter({ mergeParams: true });

router.route('/:question').get(asyncHandler(controller.getChangePage));

export default router;
