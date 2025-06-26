import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validatePreserveGrantLoan = createYesNoRadioValidator(
	'preserveGrantLoanRadio',
	'Select whether a grant or loan has been made to preserve the listed building at the appeal site?'
);
