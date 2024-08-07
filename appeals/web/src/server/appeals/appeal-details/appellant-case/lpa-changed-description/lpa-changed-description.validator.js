import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeLPAChangedDescription = createValidator(
	body('lpaChangedDescriptionRadio').isIn(['yes', 'no']).withMessage('Please select Yes or No')
);
