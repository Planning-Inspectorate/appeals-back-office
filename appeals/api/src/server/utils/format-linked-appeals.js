/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Appeals.LinkedAppeal} LinkedAppeal */
/** @typedef {import('@pins/appeals.api').Appeals.RelatedAppeal} RelatedAppeal */

/**
 * @param {import('./db-client/index.js').AppealRelationship[]} linkedAppeals
 * @param {string} reference
 * @param { Appeal[] | null} formattedAppealWithLinkedTypes
 * @returns {LinkedAppeal[]}
 */
const formatLinkedAppeals = (linkedAppeals, reference, formattedAppealWithLinkedTypes) => {
	const childRelationships = linkedAppeals.filter((link) => link.parentRef === reference);
	const parentRelationship = linkedAppeals.find((link) => link.childRef === reference);

	if (childRelationships.length) {
		return childRelationships.map((rel) => {
			return {
				appealId: rel.childId,
				appealReference: rel.childRef,
				isParentAppeal: false,
				linkingDate: rel.linkingDate,
				appealType: assignAppealType(formattedAppealWithLinkedTypes, rel.childId),
				relationshipId: rel.id,
				externalSource: rel.externalSource || false,
				externalId: rel.externalId,
				externalAppealType: rel.externalAppealType
			};
		});
	} else if (parentRelationship) {
		return [
			{
				appealId: parentRelationship.parentId,
				appealReference: parentRelationship.parentRef,
				isParentAppeal: true,
				linkingDate: parentRelationship.linkingDate,
				appealType: assignAppealType(formattedAppealWithLinkedTypes, parentRelationship.parentId),
				relationshipId: parentRelationship.id,
				externalSource: parentRelationship.externalSource || false,
				externalId: parentRelationship.externalId,
				externalAppealType: parentRelationship.externalAppealType
			}
		];
	}

	return [];
};

/**
 * @param {import('./db-client/index.js').AppealRelationship[]} relatedAppeals
 * @param { number } currentAppealId
 * @param { Appeal[] | null} formattedAppealWithLinkedTypes
 * @returns {RelatedAppeal[]}
 */
const formatRelatedAppeals = (relatedAppeals, currentAppealId, formattedAppealWithLinkedTypes) => {
	return relatedAppeals.map((rel) => {
		const appealId = currentAppealId === rel.parentId ? rel.childId : rel.parentId;
		const appealReference = currentAppealId === rel.parentId ? rel.childRef : rel.parentRef;

		return {
			appealId,
			appealReference,
			externalSource: rel.externalSource === true,
			linkingDate: rel.linkingDate,
			appealType: assignAppealType(formattedAppealWithLinkedTypes, appealId),
			externalAppealType: rel.externalAppealType,
			relationshipId: rel.id,
			externalId: rel.externalId
		};
	});
};

/**
 * @param {Appeal[] | null} formattedAppealWithLinkedTypes
 * @param {number| null} appealId
 * @returns {string | null}
 */
const assignAppealType = (formattedAppealWithLinkedTypes, appealId) => {
	if (formattedAppealWithLinkedTypes) {
		const matchedAppeal = formattedAppealWithLinkedTypes.find((appeal) => appeal.id === appealId);

		if (matchedAppeal && matchedAppeal.appealType) {
			return `${matchedAppeal.appealType.type} (${matchedAppeal.appealType.key})`;
		}
	}

	return null;
};

export { formatLinkedAppeals, formatRelatedAppeals };
