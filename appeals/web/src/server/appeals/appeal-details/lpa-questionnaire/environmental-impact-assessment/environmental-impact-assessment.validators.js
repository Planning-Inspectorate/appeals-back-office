import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createTextareaConditionalValidator } from '#lib/validators/textarea-validator.js';

export const validateSensitiveAreaDetailsTextArea = createTextareaConditionalValidator(
	'eiaSensitiveAreaDetails',
	'eiaSensitiveAreaDetailsRadio',
	'yes',
	'Enter in, partly in, or likely to affect a sensitive area details',
	textInputCharacterLimits.defaultTextareaLength,
	`In, partly in, or likely to affect a sensitive area details must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);

export const validateConsultedBodiesDetailsTextArea = createTextareaConditionalValidator(
	'eiaConsultedBodiesDetails',
	'eiaConsultedBodiesDetailsRadio',
	'yes',
	'Enter consulted relevant statutory consultees details',
	textInputCharacterLimits.defaultTextareaLength,
	`Consulted relevant statutory consultees details must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);
