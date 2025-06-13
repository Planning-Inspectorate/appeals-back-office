import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createTextareaCharacterValidator } from '#lib/validators/textarea-validator.js';

export const updateCorrectionNoticeValidator = createTextareaCharacterValidator(
	'correctionNotice',
	'Enter the correction notice',
	textInputCharacterLimits.defaultTextareaLength,
	`Correction notice must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);
