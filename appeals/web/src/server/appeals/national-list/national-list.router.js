import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './national-list.controller.js';

const router = createRouter();

router.route('/').get(asyncHandler(controller.viewNationalList));

//This is a test route to check user permissions on AD
router.route('/ad').get(asyncHandler(controller.getCaseOfficers));

export default router;
