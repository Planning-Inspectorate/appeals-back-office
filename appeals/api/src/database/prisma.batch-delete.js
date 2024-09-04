/**
 * @param {Function} findManyFunction
 * @param {Function} deleteManyFunction
 * @param {number} batchSize
 * @returns {Promise<void>}
 */
export const batchDelete = async (findManyFunction, deleteManyFunction, batchSize = 500) => {
	let moreRecords = true;

	while (moreRecords) {
		const records = await findManyFunction({
			take: batchSize,
			select: { documentGuid: true, version: true }
		});

		if (records.length > 0) {
			await deleteManyFunction({
				where: {
					OR: records.map((record) => ({
						documentGuid: record.documentGuid,
						version: record.version
					}))
				}
			});

			moreRecords = records.length === batchSize;
		} else {
			moreRecords = false;
		}
	}
};
