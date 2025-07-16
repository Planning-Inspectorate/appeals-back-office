import { databaseConnector } from '#utils/database-connector.js';

/**
 * @param {{appealId: number, preparationTime: number, sittingTime: number, reportingTime: number}} params
 * @returns {Promise<any>}
 */
export const addInquiryEstimate = async ({
	appealId,
	preparationTime,
	sittingTime,
	reportingTime
}) => {
	return databaseConnector.inquiryEstimate.create({
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
export const updateInquiryEstimate = async ({
	appealId,
	preparationTime,
	sittingTime,
	reportingTime
}) => {
	return databaseConnector.inquiryEstimate.update({
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
export const deleteInquiryEstimate = async (appealId) => {
	return databaseConnector.inquiryEstimate.delete({
		where: {
			appealId
		}
	});
};

/**
 * @param {number} appealId
 * @returns {Promise<any>}
 */
export const getInquiryEstimateByAppealId = async (appealId) => {
	return databaseConnector.inquiryEstimate.findUnique({
		where: {
			appealId
		}
	});
};
