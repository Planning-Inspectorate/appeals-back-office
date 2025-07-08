import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import logger from '#lib/logger.js';
import { getLinkableAppealSummaryFromReference } from './other-appeals.service.js';

export const validateAddOtherAppealsReference = createValidator(
	body('addOtherAppealsReference')
		.trim()
		.notEmpty()
		.withMessage('Enter an appeal reference')
		.isLength({ min: 7, max: 7 })
		.withMessage('Appeal reference must be 7 digits')
		.isNumeric()
		.withMessage('Enter appeal reference number using numbers 0 to 9')
		.bail()
		.custom(async (reference, { req }) => {
			try {
				const linkableAppealSummary = await getLinkableAppealSummaryFromReference(
					req.apiClient,
					reference
				).catch((error) => {
					if (error.response?.statusCode === 404) {
						return Promise.reject();
					} else if (error.response?.statusCode === 500) {
						req.body.problemWithHorizon = true;
						return true; // avoids failing validation chain (scenario where Horizon is down is handled by rendering a special error page instead of a validation error)
					}
				});

				req.session.linkableAppeal = {
					linkableAppealSummary
				};

				return Promise.resolve();
			} catch (error) {
				logger.error(error);
				throw new Error('error when attempting to validate linkable appeal reference');
			}
		})
		.withMessage('Enter a valid appeal reference')
);

export const validateRelateAppealAnswer = createValidator(
	body('relateAppealsAnswer')
		.trim()
		.notEmpty()
		.withMessage('You must answer if you want to relate appeals')
);

export const validateRemoveRelateAppealAnswer = createValidator(
	body('removeAppealRelationship')
		.trim()
		.notEmpty()
		.withMessage('You must answer if you want to remove the relationship')
);
