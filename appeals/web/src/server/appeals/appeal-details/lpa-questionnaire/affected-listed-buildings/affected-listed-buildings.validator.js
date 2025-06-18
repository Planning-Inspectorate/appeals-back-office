import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { getAffectedListedBuilding } from '#appeals/appeal-details/lpa-questionnaire/affected-listed-buildings/affected-listed-buildings.service.js';

export const validateAffectedListedBuilding = createValidator(
	body('affectedListedBuilding')
		.notEmpty()
		.withMessage('Provide a listed building entry list number')
		.isNumeric()
		.withMessage('Listed building entry number must be 7 digits')
		.isLength({ min: 7, max: 7 })
		.withMessage('Listed building entry number must be 7 digits')
		.custom(async (reference, { req }) => {
			try {
				const result = await getAffectedListedBuilding(req.apiClient, reference);

				if (!result) {
					return Promise.reject();
				}
			} catch (error) {
				return Promise.reject();
			}

			return Promise.resolve();
		})
		.withMessage('Enter a real listed building entry number')
);
