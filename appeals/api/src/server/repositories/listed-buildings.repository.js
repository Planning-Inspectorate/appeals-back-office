import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.ListedBuildingSelected} ListedBuilding */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * Adds a listed building with a list entry
 * @param {number} lpaQuestionnaireId
 * @param {string} listEntry
 * @param {boolean} affectsListedBuilding
 * @returns {Promise<ListedBuilding>}
 */
export const addListedBuilding = async (lpaQuestionnaireId, listEntry, affectsListedBuilding) => {
	return databaseConnector.listedBuildingSelected.create({
		data: {
			lpaQuestionnaireId: Number(lpaQuestionnaireId),
			listEntry,
			affectsListedBuilding
		}
	});
};

/**
 * Updates a listed building with a list entry
 * @param {string} listedBuildingId
 * @param {string} listEntry
 * @param {boolean} affectsListedBuilding
 * @returns {Promise<boolean>}
 */
export const updateListedBuilding = async (listedBuildingId, listEntry, affectsListedBuilding) => {
	const transaction = databaseConnector.$transaction(async (tx) => {
		const listedBuilding = await tx.listedBuildingSelected.findUnique({
			where: { id: Number(listedBuildingId) }
		});
		if (!listedBuilding) {
			return false;
		}
		await tx.listedBuildingSelected.update({
			where: {
				id: Number(listedBuildingId)
			},
			data: {
				listEntry,
				affectsListedBuilding
			}
		});
		return true;
	});

	return transaction;
};

/**
 * Removes a listed building with a list entry
 * @param {string} listedBuildingId
 * @returns {Promise<boolean>}
 */
export const removeListedBuilding = async (listedBuildingId) => {
	const transaction = databaseConnector.$transaction(async (tx) => {
		const listedBuilding = await tx.listedBuildingSelected.findUnique({
			where: { id: Number(listedBuildingId) }
		});
		if (!listedBuilding) {
			return false;
		}
		await tx.listedBuildingSelected.delete({
			where: {
				id: Number(listedBuildingId)
			}
		});
		return true;
	});

	return transaction;
};
