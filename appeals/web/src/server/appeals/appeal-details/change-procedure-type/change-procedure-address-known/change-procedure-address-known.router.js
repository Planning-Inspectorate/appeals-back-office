import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	getChangeInquiryAddressKnown,
	postChangeInquiryAddressKnown
} from './change-procedure-address-known.controller.js';
import * as validators from './change-procedure-address-known.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(getChangeInquiryAddressKnown))
	.post(
		validators.validateAddressKnown,
		saveBodyToSession('changeProcedureType', { scopeToAppeal: true }),
		asyncHandler(postChangeInquiryAddressKnown)
	);

export default router;
