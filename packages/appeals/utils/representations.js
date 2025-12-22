/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */

/**
 * @param {Representation[]} representations
 * @param {string} type
 * @returns {Representation}
 * */
export const getSingularRepresentation = (representations, type) => {
	const reps = representations?.filter((rep) => rep.representationType === type) ?? [];
	if (reps.length > 1) {
		const validReps = reps.filter((rep) => rep.status !== 'invalid');
		if (validReps.length === 1) return validReps[0];
		return validReps[0] ?? reps[0];
	}
	return reps[0];
};
