import { createValidator } from '@pins/express';
import { body } from 'express-validator';

// Validator to ensure at least one checkbox is selected

// All possible grounds that can be selected.
const allGrounds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];

// Create a validation chain for each ground's text reason input.
const reasonValidators = allGrounds.map((groundName) =>
	createValidator(
		body(`ground-${groundName}`)
			.if(
				body('groundsFacts').custom((selectedGrounds) => {
					if (!selectedGrounds) return false;
					const grounds = Array.isArray(selectedGrounds) ? selectedGrounds : [selectedGrounds];
					return grounds.includes(groundName);
				})
			)
			.trim()
			.notEmpty()
			.withMessage(`Enter a reason for selecting ground (${groundName.toUpperCase()})`)
	)
);

export const validateGroundsAndFacts = [...reasonValidators];
