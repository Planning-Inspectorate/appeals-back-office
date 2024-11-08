/** @type {import('./types.d.ts').InitialiseAndMapDataFactory} */
export const initialiseAndMapDataFactory = (
	getSubmapperParams,
	submaps,
	getAppealType,
	targetKey
) => {
	return (innerParams) => {
		/** @type {MappedInstructions} */
		const instructions = {};

		const submappers = submaps[getAppealType(innerParams)];

		const submapperParams = getSubmapperParams(innerParams);

		Object.entries(submappers).forEach(([key, submapper]) => {
			instructions[key] = submapper(submapperParams);
		});

		/** @type {Record<typeof targetKey, MappedInstructions>} */
		// @ts-ignore
		const mappedData = { [targetKey]: instructions };

		return mappedData;
	};
};
