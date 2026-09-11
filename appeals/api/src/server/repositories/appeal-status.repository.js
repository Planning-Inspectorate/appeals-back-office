import { databaseConnector } from '#utils/database-connector.js';

/**
 * @param {number} appealId
 * @param {string} status
 * @returns {Promise<object>}
 */
const updateAppealStatusByAppealId = (appealId, status) =>
	databaseConnector.$transaction([
		databaseConnector.appealStatus.updateMany({
			where: { appealId },
			data: { valid: false }
		}),
		databaseConnector.appealStatus.create({
			data: {
				appealId,
				createdAt: new Date(),
				status,
				valid: true
			}
		}),
		databaseConnector.appeal.update({
			where: { id: appealId },
			data: {
				currentStatus: status
			}
		})
	]);

/**
 * Rolls back an appeal's status history to a specified point in time and transitions to a target status.
 *
 * Process:
 * 1. Locates the `fromStatus` record (defaults to `targetStatus`) to act as the timeline anchor.
 * 2. Deletes all status records after the from status
 * 3. Updates `appeal.currentStatus` to `targetStatus`.
 * 4. Resolves the active status record:
 *    - If `fromStatus === targetStatus`: Reactivates the existing record (`valid: true`).
 *    - If `fromStatus !== targetStatus`: Creates a new valid record for `targetStatus`
 * @param {number} appealId
 * @param {string} targetStatus
 * @param {string} [fromStatus] Status anchor after which subsequent records are purged (defaults to targetStatus)
 * @returns {Promise<object>}
 */
const rollBackAppealStatusTo = (appealId, targetStatus, fromStatus = targetStatus) =>
	databaseConnector.$transaction(async (tx) => {
		const baseStatus = await tx.appealStatus.findFirst({
			where: { appealId, status: fromStatus }
		});

		if (!baseStatus) {
			throw new Error(`Appeal status ${fromStatus} not found for appeal ${appealId}`);
		}

		await tx.appealStatus.deleteMany({
			where: {
				appealId: baseStatus.appealId,
				createdAt: {
					gt: baseStatus.createdAt
				}
			}
		});

		await tx.appeal.update({
			where: { id: baseStatus.appealId },
			data: { currentStatus: targetStatus }
		});

		if (fromStatus === targetStatus) {
			return await tx.appealStatus.update({
				where: { id: baseStatus.id },
				data: { valid: true }
			});
		}

		await tx.appealStatus.updateMany({
			where: { appealId, valid: true },
			data: { valid: false }
		});

		return await tx.appealStatus.create({
			data: {
				appealId,
				createdAt: new Date(),
				status: targetStatus,
				valid: true
			}
		});
	});

/**
 * @param {number} appealId
 * @param {string} status
 * @returns {Promise<{createdDate: Date}|undefined>}
 */
const getAppealStatusCreatedDate = async (appealId, status) => {
	const appealStatus = await databaseConnector.appealStatus.findFirst({
		where: {
			appealId: appealId,
			status
		}
	});

	if (appealStatus) {
		return { createdDate: appealStatus.createdAt };
	}
};

export default {
	updateAppealStatusByAppealId,
	rollBackAppealStatusTo,
	getAppealStatusCreatedDate
};
