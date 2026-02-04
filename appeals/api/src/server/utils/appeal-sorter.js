/** @typedef {import('@pins/appeals.api').Appeals.AppealListResponse} AppealListResponse */

import { isLinkedAppealsActive } from '#utils/is-linked-appeal.js';

const DEFAULT_SORT_VALUE = 'DEFAULT_SORT_VALUE';
/**
 *
 * @param {AppealListResponse[]} appeals
 * @returns {AppealListResponse[]}
 */
export const sortAppeals = (appeals) => {
	if (!isLinkedAppealsActive()) {
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
		const aKey = sortKeys.get(a.appealReference) ?? DEFAULT_SORT_VALUE;
		const bKey = sortKeys.get(b.appealReference) ?? DEFAULT_SORT_VALUE;
		if (aKey === bKey) return 0;
		return aKey < bKey ? -1 : 1;
	});
};

/**
 *
 * @param {AppealListResponse[]} appeals
 * @returns {Map<string, string>}
 */
const buildSortKeys = (appeals) => {
	const sortKeys = new Map();
	let group = { leadReference: '', dueDate: DEFAULT_SORT_VALUE, children: [] };

	const finalizeGroup = () => {
		if (group.leadReference && group.dueDate) {
			sortKeys.set(group.leadReference, group.dueDate + '-' + group.leadReference + '-A-0');
			group.children.forEach((reference, i) =>
				sortKeys.set(reference, group.dueDate + '-' + group.leadReference + '-B-' + i)
			);
		}
		group = { leadReference: '', dueDate: DEFAULT_SORT_VALUE, children: [] };
	};

	appeals.forEach((appeal) => {
		const dueDate = appeal.dueDate ? new Date(appeal.dueDate).getTime() : DEFAULT_SORT_VALUE;

		if (appeal.isParentAppeal) {
			finalizeGroup();
			group.leadReference = appeal.appealReference;
			group.dueDate = dueDate + '';
		} else if (appeal.isChildAppeal) {
			// @ts-ignore
			group.children.push(appeal.appealReference);
		} else {
			finalizeGroup();
			sortKeys.set(appeal.appealReference, dueDate + '-' + appeal.appealReference + '-C-0');
		}
	});

	finalizeGroup();
	return sortKeys;
};
