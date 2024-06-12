/**
 *
 * @param {Date | null | undefined} value
 * @returns { string | null }
 */
export const mapDate = (value) => {
	if (!value || value === null) {
		return null;
	}

	return value.toISOString();
};
