import { representationHasAddress } from '#lib/address-formatter.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateStatus = createValidator(
	body('status')
		.notEmpty()
		.withMessage('Select your review decision')
		.bail()
		.isIn(Object.values(COMMENT_STATUS))
		.withMessage('Select your review decision')
);

export const validateSiteVisit = createValidator(
	body('site-visit-request')
		.custom((_, { req }) => {
			const { currentRepresentation } = req;
			const hasAddress = representationHasAddress(currentRepresentation);

			// ignore if we have an address or site visit is not requested
			if (
				hasAddress ||
				!('site-visit-request' in req.body) ||
				req.body['site-visit-request'].length === 0
			) {
				return true;
			}

			// require an address for setting a site visit
			throw new Error('Add an address');
		})
		.withMessage('Add an address')
);
