import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './accessibility-statement.controller.js';

const router = createRouter();

router.route('/').get(asyncHandler(controller.viewAccessibilityStatement));

export default router;
