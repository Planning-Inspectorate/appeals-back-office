import { getChangedListedBuilding } from '#appeals/appeal-details/lpa-questionnaire/changed-listed-buildings/changed-listed-buildings.service.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangedListedBuilding = createValidator(
	body('changedListedBuilding')
		.notEmpty()
		.withMessage('Provide a listed building entry list number')
		.isNumeric()
		.withMessage('Listed building entry number must be 7 digits')
		.isLength({ min: 7, max: 7 })
		.withMessage('Listed building entry number must be 7 digits')
		.custom(async (reference, { req }) => {
			try {
				const result = await getChangedListedBuilding(req.apiClient, reference);

				if (!result) {
					throw new Error('Listed building entry number is not valid');
				}
			} catch (error) {
				throw new Error('Listed building entry number is not valid');
			}
		})
		.withMessage('Enter a real listed building entry number')
);
