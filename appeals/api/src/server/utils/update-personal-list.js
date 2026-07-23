import appealRepository from '#repositories/appeal.repository.js';
import { databaseConnector } from '#utils/database-connector.js';
import logger from '#utils/logger.js';

/**
 * Updates the PersonalList for the specified appeal
 * @param {number} appealId
 * @returns {Promise<void>}
 */
export const updatePersonalList = async (appealId) => {
	await setPersonalList({ appealId });
};

/**
 * Executes the spSetPersonalList stored procedure.
 * @param {{appealId?: number | null}} [options]
 * @returns {Promise<void>}
 */
export const setPersonalList = async ({ appealId = null } = {}) => {
	const parsedAppealId = appealId === null ? null : Number(appealId);

	if (appealId !== null && Number.isNaN(parsedAppealId)) {
		throw new Error(`spSetPersonalList appealId must be numeric. Received: ${appealId}`);
	}

	await databaseConnector.$executeRawUnsafe(
		`EXEC dbo.spSetPersonalList @appealId = ${parsedAppealId === null ? 'NULL' : parsedAppealId};`
	);
};

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms
 * @returns {Promise<unknown>}
 */
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Refreshes the PersonalList for all appeals that have no PersonalList entries
 * @param {boolean} [forceFullRefresh]
 * @returns {Promise<void>}
 */
export async function refreshPersonalList(forceFullRefresh = false) {
	try {
		if (forceFullRefresh) {
			logger.info(`PersonalList full refresh starting`);
			await setPersonalList();
			logger.info(`PersonalList full refresh complete`);
			return;
		}

		const appealsWithoutPersonalListEntry = await appealRepository.getAppealIdList(true);
		if (appealsWithoutPersonalListEntry.length > 0) {
			logger.info(
				`PersonalList will be refreshed for ${appealsWithoutPersonalListEntry.length} appeals`
			);
			for (const appeal of appealsWithoutPersonalListEntry) {
				await setPersonalList({ appealId: appeal.id });
				await sleep(5); // sleep for 5 milliseconds
			}
			logger.info(`PersonalList refresh complete`);
		}
	} catch (error) {
		// @ts-ignore
		logger.error(`Error refreshing PersonalList: ${error.message}`);
	}
}
