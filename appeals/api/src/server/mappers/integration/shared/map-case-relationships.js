/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.NeighbouringSite} NeighbouringSite */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 * @param {MappingRequest} data
 * @returns
 */
export const mapCaseRelationships = (data) => {
	const { appeal } = data;
	const { linkedAppeals, relatedAppeals } = appeal;

	let linkedCaseStatus = null;
	let leadCaseReference = null;
	if (linkedAppeals && linkedAppeals.length) {
		const lead = linkedAppeals.find((_) => _.parentId === appeal.id);
		if (lead) {
			linkedCaseStatus = 'lead';
			leadCaseReference = appeal.reference;
		} else {
			const child = linkedAppeals.find((_) => _.childId === appeal.id);
			if (child) {
				linkedCaseStatus = 'child';
				leadCaseReference = child.parentRef;
			}
		}
	}

	const nearbyCaseReferences = (relatedAppeals ?? []).map((a) =>
		a.parentRef === appeal.reference ? a.childRef : a.parentRef
	);

	return {
		linkedCaseStatus,
		leadCaseReference,
		nearbyCaseReferences
	};
};
