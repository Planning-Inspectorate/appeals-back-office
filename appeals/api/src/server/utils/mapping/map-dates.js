/** @typedef {import('@pins/appeals.api').Schema.AppealStatus} AppealStatus */

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
 * @param {AppealStatus[]} appealStatuses
 * @param {string} status
 */
export const findStatusDate = (appealStatuses, status) => {
	const appealStatus = appealStatuses.find((state) => state.status === status);
	if (appealStatus) {
		return appealStatus.createdAt?.toISOString();
	}

	return null;
};
