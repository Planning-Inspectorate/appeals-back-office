import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeInNearOrLikelyToAffectDesignatedSites = createValidator(
	body()
		.custom((bodyFields) => {
			const checkboxValues = Array.isArray(
				bodyFields.inNearOrLikelyToAffectDesignatedSitesCheckboxes
			)
				? bodyFields.inNearOrLikelyToAffectDesignatedSitesCheckboxes
				: [bodyFields.inNearOrLikelyToAffectDesignatedSitesCheckboxes];

			return !(checkboxValues.includes('other') && bodyFields.customDesignation.length === 0);
		})
		.withMessage('Enter details of the other designation(s)')
);
