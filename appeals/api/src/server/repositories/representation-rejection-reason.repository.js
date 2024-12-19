import { databaseConnector } from '#utils/database-connector.js';

/**
 * @param {string} representationType
 * */
const getAllByType = (representationType) =>
	databaseConnector.representationRejectionReason.findMany({
		where: { representationType }
	});

export default { getAllByType };
