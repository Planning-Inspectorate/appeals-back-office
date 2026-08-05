import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateSignificantChanges = createValidator(
	body('anySignificantChangesReasonCheckboxes')
		.notEmpty()
		.withMessage('Select a significant change, or select ‘There have been no significant changes’')
);

const anySignificantChangesOptions = [
	{ label: 'anySignificantChanges_localPlanSignificantChanges', text: 'Adopted a new local plan' },
	{
		label: 'anySignificantChanges_nationalPolicySignificantChanges',
		text: 'National policy change'
	},
	{ label: 'anySignificantChanges_courtJudgementSignificantChanges', text: 'Court judgement' },
	{ label: 'anySignificantChanges_otherSignificantChanges', text: 'Other' }
];

const reasonValidator = createValidator(
	body('anySignificantChangesReasonCheckboxes').custom((selectedReasons, { req }) => {
		if (selectedReasons) {
			const reasons = Array.isArray(selectedReasons) ? selectedReasons : [selectedReasons];
			const firstEmptyReason = anySignificantChangesOptions.find(
				(option) =>
					reasons.includes(option.label) &&
					(!req.body[option.label] || req.body[option.label].trim() === '')
			);

			if (firstEmptyReason) {
				throw new Error(`Enter the significant changes and why they’re relevant`);
			}
		}
		return true;
	})
);

export const validateSignificantChangesAndReason = [validateSignificantChanges, reasonValidator];
