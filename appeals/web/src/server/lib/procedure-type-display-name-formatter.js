/**
 * @param {"Written" | "Part 1" | string} procedureTypeDisplayName
 * @returns (substring: string, ...args: any[]) => string
 */
export const getWrittenProcedureTypeDisplayLabel = (procedureTypeDisplayName) => {
	if (procedureTypeDisplayName === 'Written') {
		return 'Written representations (Part 2)';
	} else if (procedureTypeDisplayName === 'Part 1') {
		return 'Written representations (Part 1)';
	}
};
