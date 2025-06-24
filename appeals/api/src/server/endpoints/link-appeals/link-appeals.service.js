/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 * Checks if an appeal is linked to other appeals as a parent.
 * @param {{ childAppeals?: any[] }} appeal The appeal to check for linked appeals.
 * @param {string} type The linkable type to check for.
 * @returns {boolean}
 */
const isAppealLead = (appeal, type) =>
	Boolean(appeal.childAppeals?.some((childAppeal) => childAppeal.type === type));

/**
 * Checks if an appeal is linked to other appeals as a child.
 * @param {{ parentAppeals?: any[] }} appeal The appeal to check for linked appeals.
 * @param {string} type The linkable type to check for.
 * @returns {boolean}
 */
const isAppealChild = (appeal, type) =>
	Boolean(appeal.parentAppeals?.some((parentAppeal) => parentAppeal.type === type));

/**
 * Checks if an appeal can be linked, with a specific relationship type (parent/child).
 * @param {{ childAppeals?: unknown[], parentAppeals?: unknown[] }} appeal The appeal to check for linked appeals.
 * @param {string} type The linkable type to check for.
 * @param {'lead'|'child'} relationship The relationship to check for.
 * @returns {boolean}
 */
export const canLinkAppeals = (appeal, type, relationship) => {
	const isLead = isAppealLead(appeal, type);
	const isChild = isAppealChild(appeal, type);

	return relationship === 'lead' ? !isChild : !isChild && !isLead;
};
