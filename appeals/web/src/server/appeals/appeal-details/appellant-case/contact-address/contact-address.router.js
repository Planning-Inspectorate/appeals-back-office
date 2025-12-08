import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateAppealWithInclude } from '../../appeal-details.middleware.js';
import * as controllers from './contact-address.controller.js';
import { validateChangeContactAddress } from './contact-address.validator.js';

const router = createRouter({ mergeParams: true });

/**
 * @type {import("express").RequestHandler}
 * @returns {void}
 */
const validateAddressId = (req, res, next) => {
	const {
		currentAppeal,
		params: { addressId }
	} = req;
	const contactAddressId =
		currentAppeal?.enforcementNotice?.appellantCase?.contactAddress?.addressId;

	if (!contactAddressId || contactAddressId !== parseInt(addressId)) {
		return res.status(404).render('app/404.njk');
	}
	next();
};

router
	.route('/add')
	.get(
		validateAppealWithInclude(['appellantCase']),
		asyncHandler(controllers.getManageContactAddress)
	)
	.post(
		validateAppealWithInclude(['appellantCase']),
		validateChangeContactAddress,
		asyncHandler(controllers.postAddContactAddress)
	);

router
	.route('/change/:addressId')
	.get(
		validateAppealWithInclude(['appellantCase']),
		validateAddressId,
		asyncHandler(controllers.getManageContactAddress)
	)
	.post(
		validateAppealWithInclude(['appellantCase']),
		validateAddressId,
		validateChangeContactAddress,
		asyncHandler(controllers.postChangeContactAddress)
	);

export default router;
