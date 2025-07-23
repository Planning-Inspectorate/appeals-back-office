import appealRepository from '#repositories/appeal.repository.js';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';
import { isLinkedAppeal } from '#utils/is-linked-appeal.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 *
 * @param {Appeal} parentAppeal
 * @param {Appeal} childAppeal
 */
function augmentChildAppealWithParentAppealRelationshipData(parentAppeal, childAppeal) {
	// Retrieve the parent appeal linked appeal relationship data (parentAppeals) for the current childAppeal from the parentAppeal's list
	// of linked appeal relationship data (childAppeals) for child appeals and augment the childAppeal with the parentAppeals property containing the retrieved entry.
	const parentAppeals = parentAppeal.childAppeals?.filter(
		(child) => child.childId === childAppeal.id
	);
	return { ...childAppeal, parentAppeals };
}

/**
 *
 * @param {Appeal} parentAppeal
 * @returns {Promise<(Appeal|(Appeal&{parentAppeals: Appeal}))[]>}
 */
export async function buildListOfLinkedAppeals(parentAppeal) {
	if (!isLinkedAppeal(parentAppeal)) {
		// No appeals are linked
		return [];
	}

	// Make sure the parentAppeal is the parent of the group of linked appeals
	if (parentAppeal.parentAppeals?.length) {
		// This could be a child, check if it has a parent that is a linked appeal
		parentAppeal =
			parentAppeal.parentAppeals.filter(({ type }) => type === CASE_RELATIONSHIP_LINKED)?.[0]
				?.parent || parentAppeal;
	}

	const linkedChildAppeals = await appealRepository.getLinkedAppeals(
		parentAppeal.reference,
		CASE_RELATIONSHIP_LINKED
	);

	// @ts-ignore
	const childAppeals = linkedChildAppeals.map(({ child }) => child);

	// As the function appealRepository.getAppealsByIds does not return the parentAppeals array property (list of child appeal, parent appeal relationships), we need to add this to each child appeal.
	// As the parentAppeal contains the array of childAppeals (list of child appeal, parent appeal relationships), it's possible to add the parentAppeals property with the correct entry taken from the parentAppeal's childAppeals list.

	const childAppealsAugmentedWithParentAppealRelationshipData = childAppeals.map(
		(childAppeal) =>
			childAppeal && augmentChildAppealWithParentAppealRelationshipData(parentAppeal, childAppeal)
	);

	// @ts-ignore
	return [parentAppeal, ...childAppealsAugmentedWithParentAppealRelationshipData];
}
