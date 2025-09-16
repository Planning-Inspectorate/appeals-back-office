/**
 * @param {...(string)} ids
 * @returns {boolean}
 */
export const areIdParamsValid = (...ids) => {
	const ID_PATTERN = /^[0-9]+$/;

	return ids.every((id) => ID_PATTERN.test(id));
};
