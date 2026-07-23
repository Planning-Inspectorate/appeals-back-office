import personalListRepository from '#repositories/personal-list.repository.js';
import { isAwaitingLinkedAppeal } from '#utils/is-awaiting-linked-appeal.js';

/** @typedef {import('#repositories/personal-list.repository.js').getPersonalListRepoResponse} getPersonalListRepoResponse */
/** @typedef {getPersonalListRepoResponse['personalList'][number]} PersonalListItem */
/** @typedef {PersonalListItem & { toRemove?: boolean } & { awaitingLinkedAppeal?: boolean }} PersonalListItemForLinkedAppeal */

/**
 *
 * @param {PersonalListItemForLinkedAppeal[]} personalList
 * @param {string} azureUserId
 * @param {number} pageSize
 * @param {string} [status]
 * @returns {Promise<PersonalListItemForLinkedAppeal[]>}
 */
const addAwaitingLinkedAppealToPersonalList = async (
	personalList,
	azureUserId,
	pageSize,
	status
) => {
	// If the last item in the personal list is a linked appeal, fetch any missing linked appeals and add them to the personal list temporarily to determine awaiting linked appeals status

	const lastItem = personalList.at(-1);
	if (personalList.length === pageSize && lastItem?.leadAppealId) {
		const { personalList: linkedAppeals = [] } = await personalListRepository.getPersonalList(
			azureUserId,
			1,
			Number.MAX_SAFE_INTEGER,
			status,
			lastItem.leadAppealId
		);
		// only add the linked appeals that are not already in the personal list
		const linkedAppealsToAddToEndOfList = linkedAppeals
			.slice(linkedAppeals.findIndex(({ appealId }) => appealId === lastItem.appealId) + 1)
			.map((linkedAppeal) => ({ ...linkedAppeal, toRemove: true }));

		if (linkedAppealsToAddToEndOfList.length > 0) {
			personalList.push(...linkedAppealsToAddToEndOfList);
		}
	}

	// If the first item in the personal list is a linked child appeal, fetch any missing linked appeals and add them to the personal list temporarily to determine awaiting linked appeals status
	const firstItem = personalList[0];
	if (firstItem.linkType === 'child') {
		const { personalList: linkedAppeals = [] } = await personalListRepository.getPersonalList(
			azureUserId,
			1,
			Number.MAX_SAFE_INTEGER,
			status,
			firstItem.leadAppealId
		);
		// only add the linked appeals that are not already in the personal list
		const linkedAppealsToAddToTopOfList = linkedAppeals
			.slice(
				0,
				linkedAppeals.findIndex(({ appealId }) => appealId === firstItem.appealId)
			)
			.map((linkedAppeal) => ({ ...linkedAppeal, toRemove: true }));
		if (linkedAppealsToAddToTopOfList.length > 0) {
			personalList.unshift(...linkedAppealsToAddToTopOfList);
		}
	}

	// Group linked appeals by parent appeal ID
	let /** @type {PersonalListItemForLinkedAppeal[]} */ linkedAppeals;
	let /** @type {number|null} */ currentLeadAppealId;
	personalList.forEach((item) => {
		// Ignore non-linked appeals
		if (!item.linkType) {
			return;
		}
		if (item.leadAppealId !== currentLeadAppealId) {
			currentLeadAppealId = item.leadAppealId;
			linkedAppeals = personalList.filter(({ leadAppealId }) => leadAppealId === item.appealId);
		}
		// Ignore items that were added temporarily to determine awaiting linked appeals status
		if (item.toRemove) {
			return;
		}
		item.awaitingLinkedAppeal = isAwaitingLinkedAppeal(
			item.appeal,
			linkedAppeals.filter(({ appealId }) => appealId !== item.appealId).map(({ appeal }) => appeal)
		);
	});

	return personalList.filter(({ toRemove }) => !toRemove);
};

export { addAwaitingLinkedAppealToPersonalList };
