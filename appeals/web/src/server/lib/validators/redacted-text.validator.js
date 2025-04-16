/**
 * @param {string} originalRepresentation
 * @param {string | undefined} redactedRepresentation
 * @returns {boolean}
 */
export const checkRedactedText = (originalRepresentation, redactedRepresentation) => {
	const normalizeNewlines = (/** @type {string | undefined} */ str) =>
		(str || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
	const normalizedOriginal = normalizeNewlines(originalRepresentation);
	const normalizedRedacted = normalizeNewlines(redactedRepresentation);
	return normalizedOriginal !== normalizedRedacted;
};
