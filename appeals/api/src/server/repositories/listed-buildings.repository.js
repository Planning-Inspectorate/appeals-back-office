import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.ListedBuildingSelected} ListedBuildingSelected */
/** @typedef {import('@pins/appeals.api').Schema.ListedBuilding} ListedBuilding */
/** @typedef {import('@pins/appeals.api').Api.ListedBuilding} ListedBuildinHistoricEngland */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * Gets a listed building by reference
 * @param {string} reference
 * @returns {Promise<ListedBuilding>}
 */
export const getListedBuilding = async (reference) => {
	// @ts-ignore
	return databaseConnector.listedBuilding.findFirst({
		where: { reference }
	});
};

/**
 * Gets a listed building by reference
 * @param {string} reference
 * @returns {Promise<ListedBuilding>}
 */
export const deleteListedBuilding = async (reference) => {
	// @ts-ignore
	return databaseConnector.listedBuilding.delete({
		where: { reference }
	});
};

/**
 * Gets a listed building by reference
 * @param {ListedBuilding} data
 * @returns {Promise<ListedBuilding>}
 */
export const upsertListedBuilding = async (data) => {
	const { reference } = data;
	// @ts-ignore
	return databaseConnector.listedBuilding.upsert({
		where: { reference },
		create: data,
		update: data
	});
};

/**
 * Adds a listed building with a list entry
 * @param {number} lpaQuestionnaireId
 * @param {string} listEntry
 * @param {boolean} affectsListedBuilding
 * @returns {Promise<ListedBuildingSelected>}
 */
export const addListedBuilding = async (lpaQuestionnaireId, listEntry, affectsListedBuilding) => {
	// @ts-ignore
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
