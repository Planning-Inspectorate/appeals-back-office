import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateSearchTerm = createValidator(
	body('searchTerm')
		.trim()
		.notEmpty()
		.withMessage('Enter a name or email address')
		.bail()
		.isLength({ min: 2, max: 80 })
		.withMessage('Search term must be between 2 and 80 characters in length')
);

export const validatePostConfirmation = (isUnassign = false, isInspector = false) =>
	createYesNoRadioValidator(
		'confirm',
		`Select yes if you would like to ${isUnassign ? 'unassign' : 'assign'} this ${
			isInspector ? 'inspector' : 'case officer'
		}`
	);

export const validateNewUserPostConfirmation = (isInspector = false) =>
	createYesNoRadioValidator(
		'confirm',
		`Select yes if you would like to assign a new ${isInspector ? 'inspector' : 'case officer'}`
	);
