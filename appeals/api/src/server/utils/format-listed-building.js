/** @typedef {import('@pins/appeals.api').Schema.ListedBuildingSelected} ListedBuildingDetails */
/** @typedef {import('@pins/appeals.api').Api.ListedBuilding} ListedBuilding */

/**
 * @param {boolean} affectsListedBuilding
 * @param {ListedBuildingDetails[] | null | undefined} values
 * @returns {ListedBuilding[] | null}
 */
export const formatListedBuildingDetails = (affectsListedBuilding, values) =>
	// @ts-ignore
	(values &&
		values
			.filter((value) => value.affectsListedBuilding === affectsListedBuilding)
			.map(({ listEntry, id }) => ({ id, listEntry }))) ||
	null;
