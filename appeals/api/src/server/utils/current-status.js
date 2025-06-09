/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#repositories/appeal-lists.repository.js').DBUserAppeal} DBUserAppeal */
/** @typedef {import('#repositories/appeal-lists.repository.js').DBAppeals} DBAppeals */
/** @typedef {DBAppeals[0]} DBAppeal */

/**
 *
 * @param {DBAppeal | DBUserAppeal | Appeal} appeal
 * @returns {string}
 */
export const currentStatus = (appeal) => {
	return appeal?.appealStatus?.find((item) => item?.valid)?.status ?? '';
};

/**
 *
 * @param {DBAppeal | DBUserAppeal | Appeal} appeal
 * @param {string} status
 * @returns {boolean}
 */
export const isCurrentStatus = (appeal, status) => {
	return currentStatus(appeal) === status;
};
