export const removeCommasFromNumericInput = (/** @type {string} */ value) =>
	Number(value.replace(/[,]/g, ''));
