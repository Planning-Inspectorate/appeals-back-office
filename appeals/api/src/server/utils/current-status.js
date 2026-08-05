/** @typedef {import('#db-client/models.ts').AppealModel } Appeal */
/** @typedef {import('#db-client/models.ts').AppealStatusModel } AppealStatus */

/**
 * @param {{currentStatus: Appeal['currentStatus']}} appeal
 * @returns {string}
 */
export const currentStatus = (appeal) => {
	return appeal?.currentStatus ?? '';
};

/**
 * @param {{currentStatus: Appeal['currentStatus']}} appeal
 * @param {string} status
 * @returns {boolean}
 */
export const isCurrentStatus = (appeal, status) => {
	return currentStatus(appeal) === status;
};

/**
 * @param {{appealStatus?: { valid: AppealStatus['valid'], status: AppealStatus['status'] }[] }} appeal
 * @returns {string[]}
 */
export const completedStateList = (appeal) => {
	return appeal?.appealStatus?.filter((item) => !item?.valid).map((item) => item?.status) ?? [];
};
