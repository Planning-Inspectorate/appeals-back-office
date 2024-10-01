import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { validateAppeal } from '../appeal-details.middleware.js';
import * as controller from './interested-party-comments.controller.js';

const router = createRouter({ mergeParams: true });

router.route('/').get(validateAppeal, asyncHandler(controller.getInterestedPartyComments));

export default router;
