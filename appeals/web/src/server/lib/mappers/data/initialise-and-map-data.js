/** @type {import('./types.js').InitialiseAndMapDataFactory} */
export const initialiseAndMapDataFactory = (
	getSubmapperParams,
	submaps,
	getAppealType,
	targetKey
) => {
	return async (innerParams, filterKeys) => {
		/** @type {MappedInstructions} */
		const instructions = {};

		const submappers = submaps[getAppealType(innerParams)];

		const submapperParams = await getSubmapperParams(innerParams);

		Object.entries(submappers).forEach(([key, submapper]) => {
			if (!filterKeys || filterKeys?.includes(key)) {
				instructions[key] = submapper(submapperParams);
			}
		});

		/** @type {Record<typeof targetKey, MappedInstructions>} */
		// @ts-ignore
		const mappedData = { [targetKey]: instructions };

		return mappedData;
	};
};
