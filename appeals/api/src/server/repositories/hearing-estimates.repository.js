import { databaseConnector } from '#utils/database-connector.js';

/**
/** @typedef {import('@pins/appeals.api').Schema.HearingEstimate} HearingEstimate */

/**
 * @param {number} appealId
 * @returns {Promise<HearingEstimate | null>} */
export const getHearingEstimateByAppealId = async (appealId) => {
	return databaseConnector.hearingEstimate.findUnique({
		where: {
			appealId
		}
	});
};

/**
 * @param {{appealId: number, preparationTime: number, sittingTime: number, reportingTime: number}} params
 * @returns {Promise<HearingEstimate>}
 */
export const addHearingEstimate = async ({
	appealId,
	preparationTime,
	sittingTime,
	reportingTime
}) => {
	return databaseConnector.hearingEstimate.create({
		data: {
			appealId,
			preparationTime,
			sittingTime,
			reportingTime
		}
	});
};

/**
 * @param {{appealId: number, preparationTime: number, sittingTime: number, reportingTime: number}} params
 * @returns {Promise<HearingEstimate>}
 */
export const updateHearingEstimate = async ({
	appealId,
	preparationTime,
	sittingTime,
	reportingTime
}) => {
	return databaseConnector.hearingEstimate.update({
		where: {
			appealId
		},
		data: {
			preparationTime,
			sittingTime,
			reportingTime
		}
	});
};

/**
 * @param {number} appealId
 * @returns {Promise<HearingEstimate>}
 */
export const deleteHearingEstimate = async (appealId) => {
	return databaseConnector.hearingEstimate.delete({
		where: {
			appealId
		}
	});
};

/**
 * @param {number[]} appealIds
 * @returns {Promise<import('#db-client/internal/prismaNamespace.js').BatchPayload>} */
export const deleteManyHearingEstimate = async (appealIds) => {
	return databaseConnector.hearingEstimate.deleteMany({
		where: {
			appealId: {
				in: appealIds
			}
		}
	});
};

/**
 * @param {{appealIds: number[], preparationTime: number, sittingTime: number, reportingTime: number}} params
 * @returns {Promise<import('#db-client/internal/prismaNamespace.js').BatchPayload>} */

export const addManyHearingEstimate = async ({
	appealIds,
	preparationTime,
	sittingTime,
	reportingTime
}) => {
	return databaseConnector.hearingEstimate.createMany({
		data: appealIds.map((/** @type {Number} */ appealId) => ({
			appealId,
			preparationTime,
			sittingTime,
			reportingTime
		}))
	});
};

/**
 * @param {{appealIds: number[], preparationTime: number, sittingTime: number, reportingTime: number}} params
 * @returns {Promise<import('#db-client/internal/prismaNamespace.js').BatchPayload>} */
export const updateManyHearingEstimate = async ({
	appealIds,
	preparationTime,
	sittingTime,
	reportingTime
}) => {
	return databaseConnector.hearingEstimate.updateMany({
		where: {
			appealId: {
				in: appealIds
			}
		},
		data: {
			preparationTime,
			sittingTime,
			reportingTime
		}
	});
};

/**
 * @param {number[]} appealIds
 * @returns {Promise<HearingEstimate[]>} */
export const getManyHearingEstimateByAppealId = async (appealIds) => {
	return databaseConnector.hearingEstimate.findMany({
		where: {
			appealId: {
				in: appealIds
			}
		}
	});
};
