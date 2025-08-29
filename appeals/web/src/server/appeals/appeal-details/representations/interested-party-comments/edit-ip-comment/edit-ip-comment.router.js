import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateInterestedPartyAddress } from '../common/validators.js';
import * as controller from './edit-ip-comment.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/address')
	.get(asyncHandler(controller.renderEditAddress))
	.post(
		validateInterestedPartyAddress,
		saveBodyToSession('editIpComment'),
		asyncHandler(controller.postEditAddress)
	);

router
	.route('/check/address')
	.get(asyncHandler(controller.renderCheckAddress))
	.post(asyncHandler(controller.postCheckPage));

router
	.route('/site-visit-requested')
	.get(asyncHandler(controller.renderSiteVisitRequested))
	.post(
		createYesNoRadioValidator('siteVisitRequested', 'Select whether comment includes a site visit'),
		asyncHandler(controller.postSiteVisitRequested)
	);

export default router;
