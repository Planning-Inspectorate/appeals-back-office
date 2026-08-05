import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateSignificantChangesLpa = createValidator(
	body('anySignificantChangesReasonLpaCheckboxes')
		.notEmpty()
		.withMessage('Select a significant change, or select ‘There have been no significant changes’')
);

const anySignificantChangesLpaOptions = [
	{
		label: 'anySignificantChangesReasonLpaCheckboxes',
		text: 'There have been no significant changes'
	},
	{
		label: 'anySignificantChangesLpa_localPlanSignificantChanges',
		text: 'Adopted a new local plan'
	},
	{
		label: 'anySignificantChangesLpa_nationalPolicySignificantChanges',
		text: 'National policy change'
	},
	{ label: 'anySignificantChangesLpa_courtJudgementSignificantChanges', text: 'Court judgement' },
	{ label: 'anySignificantChangesLpa_otherSignificantChanges', text: 'Other' }
];

const reasonValidator = createValidator(
	body('anySignificantChangesReasonLpaCheckboxes').custom((selectedReasons, { req }) => {
		if (selectedReasons) {
			const reasons = Array.isArray(selectedReasons) ? selectedReasons : [selectedReasons];
			const firstEmptyReason = anySignificantChangesLpaOptions.find(
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

export const validateSignificantChangesAndReasonLpa = [
	validateSignificantChangesLpa,
	reasonValidator
];
