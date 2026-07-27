import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.AppealStatus} AppealStatus */
/** @typedef {import('@pins/appeals.api').Schema.AppealRelationship} AppealRelationship */

/**
 * Converts an array of appeal statuses to use a new appeal ID.
 * This is useful for creating test data for linked appeals where each child appeal
 * needs its own set of statuses with unique IDs.
 *
 * @param {AppealStatus[]} statusArray - Array of appeal status objects to convert
 * @param {number} newAppealId - The new appeal ID to assign to the statuses
 * @returns {AppealStatus[]} New array of status objects with updated IDs and appealId
 */
export const convertStatusArrayToNewAppealId = (statusArray, newAppealId) => {
	return statusArray.map((/** @type {AppealStatus} */ status) => {
		return {
			...status,
			id: status.id + newAppealId * 10,
			appealId: newAppealId
		};
	});
};

/**
 * Adds appeal statuses to linked child appeals in a lead appeal object.
 * This mutates the leadAppeal object by adding appealStatus arrays to each linked child appeal.
 *
 * @param {Appeal} leadAppeal - The lead appeal object containing childAppeals
 * @param {AppealStatus[]} statusArray - The status array to apply to linked child appeals
 */
export const addStatusesToLinkedAppeals = (leadAppeal, statusArray) => {
	if (leadAppeal.childAppeals) {
		leadAppeal.childAppeals = leadAppeal.childAppeals.map(
			(/** @type {AppealRelationship} */ childAppeal) =>
				childAppeal.type == CASE_RELATIONSHIP_LINKED && childAppeal.child?.id
					? {
							...childAppeal,
							child: {
								...childAppeal.child,
								appealStatus: convertStatusArrayToNewAppealId(statusArray, childAppeal.child?.id)
							}
						}
					: childAppeal
		);
	}
};

/**
 * Gets an array of IDs for a linked group of appeals, including the lead appeal and all linked children.
 * This is commonly used for database operations that need to operate on all appeals in a linked group.
 *
 * @param {Appeal} appeal - The appeal object containing childAppeals
 * @returns {number[]} Array of appeal IDs in the linked group
 */
export const getIdsOfLinkedGroup = (appeal) => {
	const idsOfLinkedGroup = [appeal.id];
	appeal.childAppeals?.forEach((childAppeal) => {
		if (childAppeal.type === CASE_RELATIONSHIP_LINKED && childAppeal.childId !== null) {
			idsOfLinkedGroup.push(childAppeal.childId);
		}
	});
	return idsOfLinkedGroup;
};

/**
 * Creates a mock implementation function for databaseConnector.appeal.findUnique.
 * The mock will find appeals by ID, checking both the main appeal and its linked child appeals.
 * This is useful for testing scenarios where you need to mock finding appeals within a linked group.
 *
 * @param {Appeal} appeal - The appeal object containing potential childAppeals
 * @returns {Function} Mock implementation function that takes { where: { id } } and returns matching appeal
 */
export const mockAppealFindUnique = (appeal) => {
	return (/** @type {{ where: { id: number } }} */ { where: { id } }) => {
		if (appeal.id === id) {
			return appeal;
		}
		// filter the child appeals to find the one with a matching id
		const matchingChild = appeal.childAppeals?.find(
			/** @type {AppealRelationship} */ (childAppeal) => childAppeal.child?.id === id
		)?.child;
		return matchingChild || null;
	};
};
