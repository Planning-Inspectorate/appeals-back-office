import personalListRepository from '#repositories/personal-list.repository.js';
import { isAwaitingLinkedAppeal } from '#utils/is-awaiting-linked-appeal.js';

/**
 *
 * @param {*} personalList
 * @param {string} azureUserId
 * @param {number} pageSize
 * @param {string} [status]
 * @returns {Promise<[*]>}
 */
const addAwaitingLinkedAppealToPersonalList = async (
	personalList,
	azureUserId,
	pageSize,
	status
) => {
	// If the last item in the personal list is a linked appeal, fetch any missing linked appeals and add them to the personal list temporarily to determine awaiting linked appeals status

	const lastItem = personalList.at(-1);
	if (personalList.length === pageSize && lastItem.leadAppealId) {
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
	let /** @type {*}[] | undefined */ linkedAppeals;
	let /** @type {number} | undefined */ currentLeadAppealId;
	personalList.forEach(
		/** @param {*} item */ (item) => {
			// Ignore non-linked appeals
			if (!item.linkType) {
				return;
			}
			if (item.leadAppealId !== currentLeadAppealId) {
				currentLeadAppealId = item.leadAppealId;
				// @ts-ignore
				linkedAppeals = personalList.filter(({ leadAppealId }) => leadAppealId === item.appealId);
			}
			// Ignore items that were added temporarily to determine awaiting linked appeals status
			if (item.toRemove) {
				return;
			}
			// @ts-ignore
			item.awaitingLinkedAppeal = isAwaitingLinkedAppeal(
				item.appeal,
				linkedAppeals
					// @ts-ignore
					.filter(({ appealId }) => appealId !== item.appealId)
					// @ts-ignore
					.map(({ appeal }) => appeal)
			);
		}
	);

	// Remove items that were added temporarily to determine awaiting linked appeals status
	// @ts-ignore
	return personalList.filter(({ toRemove }) => !toRemove);
};

export { addAwaitingLinkedAppealToPersonalList };
