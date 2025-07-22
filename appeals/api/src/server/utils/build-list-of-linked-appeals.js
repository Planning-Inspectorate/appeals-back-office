import appealRepository from '#repositories/appeal.repository.js';

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
	const childAppealIds = parentAppeal.childAppeals?.map((childAppeal) => childAppeal.childId);

	// @ts-ignore
	const childAppeals = await appealRepository.getAppealsByIds(childAppealIds);

	// As the function appealRepository.getAppealsByIds does not return the parentAppeals array property (list of child appeal, parent appeal relationships), we need to add this to each child appeal.
	// As the parentAppeal contains the array of childAppeals (list of child appeal, parent appeal relationships), it's possible to add the parentAppeals property with the correct entry taken from the parentAppeal's childAppeals list.

	const childAppealsAugmentedWithParentAppealRelationshipData = childAppeals.map((childAppeal) =>
		augmentChildAppealWithParentAppealRelationshipData(parentAppeal, childAppeal)
	);

	return [parentAppeal, ...childAppealsAugmentedWithParentAppealRelationshipData];
}
