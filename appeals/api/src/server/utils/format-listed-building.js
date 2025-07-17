/** @typedef {import('@pins/appeals.api').Schema.ListedBuildingSelected} ListedBuildingDetails */
/** @typedef {import('@pins/appeals.api').Api.ListedBuilding} ListedBuilding */

/**
 * @param {ListedBuildingDetails[] | null | undefined} values
 * @returns {ListedBuilding[] | null}
 */
export const formatListedBuildingDetails = (values) =>
	// @ts-ignore
	(values &&
		values.map(({ listEntry, id, affectsListedBuilding, listedBuilding }) => ({
			id,
			listEntry,
			affectsListedBuilding,
			name: listedBuilding?.name,
			grade: listedBuilding?.grade
		}))) ||
	null;
