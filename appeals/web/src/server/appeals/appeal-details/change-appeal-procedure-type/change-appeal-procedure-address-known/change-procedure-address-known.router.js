import * as validators from '#appeals/appeal-details/inquiry/setup/set-up-inquiry-validators.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	getChangeInquiryAddressKnown,
	postChangeInquiryAddressKnown
} from './change-procedure-address-known.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(getChangeInquiryAddressKnown))
	.post(
		validators.validateAddressKnown,
		saveBodyToSession('changeProcedureType'),
		asyncHandler(postChangeInquiryAddressKnown)
	);

export default router;
