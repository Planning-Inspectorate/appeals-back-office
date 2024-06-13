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

/**
 *
 * @param {string | null | undefined} value
 * @returns { Date | null }
 */
export const mapDateString = (value) => {
	if (!value || value === null) {
		return null;
	}

	return new Date(value);
};
