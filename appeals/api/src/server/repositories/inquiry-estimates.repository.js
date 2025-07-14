import { databaseConnector } from '#utils/database-connector.js';

/**
 * @param {{appealId: number, estimatedTime: number }} params
 * @returns {Promise<any>}
 */
export const addInquiryEstimate = async ({ appealId, estimatedTime }) => {
	return databaseConnector.inquiryEstimate.create({
		data: {
			appealId,
			estimatedTime
		}
	});
};

/**
 * @param {{appealId: number, estimatedTime: number }} params
 * @returns {Promise<any>}
 */
export const updateInquiryEstimate = async ({ appealId, estimatedTime }) => {
	return databaseConnector.inquiryEstimate.update({
		where: {
			appealId
		},
		data: {
			estimatedTime
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
