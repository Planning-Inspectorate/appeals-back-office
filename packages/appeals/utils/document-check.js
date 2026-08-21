/**
 * Checks if the document is valid and has a document array count greater than 0.
 * Example return value: true
 *
 * @returns {boolean} - True if the document is valid and has a document array count greater than 0, false otherwise
 */
/**
 * @param {{ documents?: [] } | null | undefined} document
 * @returns {boolean}
 */
export const checkDocument = (document) => {
	if (!document || document?.documents?.length === 0) {
		return false;
	}
	return true;
};

export default checkDocument;
