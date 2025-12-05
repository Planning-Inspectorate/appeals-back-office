import { databaseConnector } from '#utils/database-connector.js';

/**
 * @param {number} appealId
 * @param {number} groundId
 * @param {object} data
 * @returns {Promise<object>}
 */
const updateAppealGroundByAppealIdAndGroundId = async (appealId, groundId, data) => {
	return databaseConnector.appealGround.upsert({
		where: {
			groundId_appealId: { groundId, appealId }
		},
		create: { appealId, groundId, ...data },
		update: data
	});
};

export default { updateAppealGroundByAppealIdAndGroundId };
