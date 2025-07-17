/** @typedef {import('@pins/appeals.api').Appeals.AppealListResponse} AppealListResponse */

import { isFeatureActive } from '#utils/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';

const DEFAULT_SORT_VALUE = 'DEFAULT_SORT_VALUE';
/**
 *
 * @param {AppealListResponse[]} appeals
 * @returns {AppealListResponse[]}
 */
export const sortAppeals = (appeals) => {
	if (!isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS)) {
		return sortByDueDate(appeals);
	}
	return sortLinkedAppeals(appeals);
};

/**
 *
 * @param {AppealListResponse[]} appeals
 * @returns {AppealListResponse[]}
 */
const sortByDueDate = (appeals) => {
	return appeals.sort((a, b) => {
		if (!a.dueDate) return 1;
		if (!b.dueDate) return -1;
		return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
	});
};

/**
 *
 * @param {AppealListResponse[]} appeals
 * @returns {AppealListResponse[]}
 */
const sortLinkedAppeals = (appeals) => {
	const sortKeys = buildSortKeys(appeals);

	return appeals.sort((a, b) => {
		const aKey = sortKeys.get(a.appealId) ?? DEFAULT_SORT_VALUE;
		const bKey = sortKeys.get(b.appealId) ?? DEFAULT_SORT_VALUE;
		if (aKey === bKey) return 0;
		return aKey < bKey ? -1 : 1;
	});
};

/**
 *
 * @param {AppealListResponse[]} appeals
 * @returns {Map<Number, string>}
 */
const buildSortKeys = (appeals) => {
	const sortKeys = new Map();
	let group = { leadId: 0, dueDate: DEFAULT_SORT_VALUE, children: [] };

	const finalizeGroup = () => {
		if (group.leadId && group.dueDate) {
			sortKeys.set(group.leadId, group.dueDate + 'A');
			group.children.forEach((id, i) => sortKeys.set(id, group.dueDate + 'B' + i));
		}
		group = { leadId: 0, dueDate: DEFAULT_SORT_VALUE, children: [] };
	};

	appeals.forEach((appeal) => {
		const dueDate = appeal.dueDate ? new Date(appeal.dueDate).getTime() : DEFAULT_SORT_VALUE;

		if (appeal.isParentAppeal) {
			finalizeGroup();
			group.leadId = appeal.appealId;
			group.dueDate = dueDate + '';
		} else if (appeal.isChildAppeal) {
			// @ts-ignore
			group.children.push(appeal.appealId);
		} else {
			finalizeGroup();
			sortKeys.set(appeal.appealId, dueDate + 'C');
		}
	});

	finalizeGroup();
	return sortKeys;
};
