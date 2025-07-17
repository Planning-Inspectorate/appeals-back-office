import { databaseConnector } from '#utils/database-connector.js';

/**
 * @param {{appealId: number, preparationTime: number, sittingTime: number, reportingTime: number}} params
 * @returns {Promise<any>}
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
 * @returns {Promise<any>}
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
 * @returns {Promise<any>}
 */
export const deleteHearingEstimate = async (appealId) => {
	return databaseConnector.hearingEstimate.delete({
		where: {
			appealId
		}
	});
};

/**
 * @param {number} appealId
 * @returns {Promise<any>}
 */
export const getHearingEstimateByAppealId = async (appealId) => {
	return databaseConnector.hearingEstimate.findUnique({
		where: {
			appealId
		}
	});
};
