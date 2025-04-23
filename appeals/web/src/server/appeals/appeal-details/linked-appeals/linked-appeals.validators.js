import logger from '#lib/logger.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { getLinkableAppealByReference } from './linked-appeals.service.js';

export const validateAddLinkedAppealReference = createValidator(
	body('appeal-reference')
		.trim()
		.notEmpty()
		.withMessage('Enter an appeal reference')
		.bail()
		.isLength({ min: 7, max: 7 })
		.withMessage('Appeal reference must be 7 digits')
		.bail()
		.custom(async (reference, { req }) => {
			try {
				const linkableAppealSummary = await getLinkableAppealByReference(
					req.apiClient,
					reference
				).catch((error) => {
					if (error.response.statusCode === 404) {
						return Promise.reject();
					}

					if (error.response.statusCode === 500) {
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

export const validateUnlinkAppeal = createValidator(
	body('unlinkAppeal').trim().notEmpty().withMessage('Please choose an option')
);
