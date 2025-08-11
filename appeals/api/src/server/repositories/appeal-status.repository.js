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
		})
	]);

/**
 * @param {number} appealId
 * @param {string} status
 * @returns {Promise<object>}
 */
const rollBackAppealStatusTo = (appealId, status) =>
	databaseConnector.$transaction(async (tx) => {
		const prevStatus = await tx.appealStatus.findFirst({
			where: { appealId, status }
		});

		if (!prevStatus) {
			throw new Error(`Appeal status ${status} not found for appeal ${appealId}`);
		}

		await tx.appealStatus.deleteMany({
			where: {
				createdAt: {
					gt: prevStatus.createdAt
				}
			}
		});

		return await tx.appealStatus.update({
			where: { id: prevStatus.id },
			data: { valid: true }
		});
	});

export default { updateAppealStatusByAppealId, rollBackAppealStatusTo };
