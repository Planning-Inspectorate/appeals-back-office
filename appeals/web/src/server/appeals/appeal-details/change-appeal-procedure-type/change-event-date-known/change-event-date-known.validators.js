import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateDateKnown = createValidator(
	body('dateKnown').custom((value, { req }) => {
		// @ts-ignore
		const {
			params: { procedureType }
		} = req;

		if (!value) {
			throw new Error(
				`Select yes if you know the date and time the ${procedureType} will take place`
			);
		}

		if (!['yes', 'no'].includes(value)) {
			throw new Error('Something went wrong');
		}

		return true; // validation passed
	})
);
