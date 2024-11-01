/**
 * @param {InputInstruction} inputOption
 * @returns {inputOption is CheckboxesInputInstruction}
 */
export function inputInstructionIsCheckboxesInputInstruction(inputOption) {
	return inputOption.type === 'checkboxes';
}

/**
 * @param {InputInstruction} inputOption
 * @returns {inputOption is RadiosInputInstruction}
 */
export function inputInstructionIsRadiosInputInstruction(inputOption) {
	return inputOption.type === 'radios';
}

/**
 * @param {InputInstruction} inputOption
 * @returns {inputOption is InputInputInstruction}
 */
export function inputInstructionIsInputInputInstruction(inputOption) {
	return inputOption.type === 'input';
}

/**
 * @param {InputInstruction} inputOption
 * @returns {inputOption is FieldsetInputInstruction}
 */
export function inputInstructionIsFieldsetInputInstruction(inputOption) {
	return inputOption.type === 'fieldset';
}
