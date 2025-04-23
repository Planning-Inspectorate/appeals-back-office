/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 * Checks if an appeal is linked to other appeals as a parent.
 * @param {{ childAppeals?: unknown[] }} appeal The appeal to check for linked appeals.
 * @returns {boolean}
 */
const isAppealLead = (appeal) => (appeal.childAppeals || []).length > 0;

/**
 * Checks if an appeal is linked to other appeals as a child.
 * @param {{ parentAppeals?: unknown[] }} appeal The appeal to check for linked appeals.
 * @returns {boolean}
 */
const isAppealChild = (appeal) => (appeal.parentAppeals || []).length > 0;

/**
 * Checks if an appeal can be linked, with a specific relationship type (parent/child).
 * @param {{ childAppeals?: unknown[], parentAppeals?: unknown[] }} appeal The appeal to check for linked appeals.
 * @param {'lead'|'child'} relationship The relationship to check for.
 * @returns {boolean}
 */
export const canLinkAppeals = (appeal, relationship) => {
	const isLead = isAppealLead(appeal);
	const isChild = isAppealChild(appeal);

	return relationship === 'lead' ? !isChild : !isChild && !isLead;
};
